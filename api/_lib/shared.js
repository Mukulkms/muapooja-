import crypto from 'node:crypto';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const MANIFEST_KEY = 'gallery.json'; // list of photos, stored inside your B2 bucket
export const PREFIX = 'gallery/';           // photos are stored under this folder
export { PutObjectCommand, DeleteObjectCommand, getSignedUrl };

const env = () => process.env;

export function configured() {
  const e = env();
  return Boolean(e.B2_KEY_ID && e.B2_APP_KEY && e.B2_BUCKET && e.B2_ENDPOINT && e.ADMIN_PASSWORD);
}

let client;
export function s3() {
  if (client) return client;
  const e = env();
  const region = e.B2_REGION || (e.B2_ENDPOINT.match(/s3\.([^.]+)\.backblazeb2/) || [])[1] || 'us-west-004';
  client = new S3Client({
    region,
    endpoint: e.B2_ENDPOINT,
    credentials: { accessKeyId: e.B2_KEY_ID, secretAccessKey: e.B2_APP_KEY },
    // Backblaze does not accept the newer default AWS checksum headers
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return client;
}

export const bucket = () => env().B2_BUCKET;
// B2_PUBLIC_URL set   -> bucket is Public: photos use plain public links.
// B2_PUBLIC_URL empty -> bucket is Private: photos get temporary signed links (free, no paid plan needed).
export const publicUrl = (key) => {
  const base = env().B2_PUBLIC_URL;
  return base ? `${base.replace(/\/$/, '')}/${key}` : '';
};

export async function withUrls(items) {
  if (env().B2_PUBLIC_URL) return items;
  return Promise.all(items.map(async (i) => ({
    ...i,
    src: await getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: i.key }), { expiresIn: 6 * 3600 }),
  })));
}

export async function readManifest() {
  try {
    const out = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: MANIFEST_KEY }));
    const data = JSON.parse(await out.Body.transformToString());
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return [];
    throw err;
  }
}

export async function writeManifest(items) {
  await s3().send(new PutObjectCommand({
    Bucket: bucket(),
    Key: MANIFEST_KEY,
    Body: JSON.stringify(items),
    ContentType: 'application/json',
    CacheControl: 'no-cache',
  }));
}

/* ---------- admin auth (password -> signed token, valid 12 hours) ---------- */
const secret = () => env().ADMIN_SECRET || env().ADMIN_PASSWORD;
const hmac = (value) => crypto.createHmac('sha256', secret()).update(String(value)).digest('hex');
const sha = (value) => crypto.createHash('sha256').update(String(value)).digest();

export function checkPassword(input) {
  return crypto.timingSafeEqual(sha(input), sha(env().ADMIN_PASSWORD));
}

export function makeToken() {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  return `${exp}.${hmac(exp)}`;
}

export function isAuthed(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = hmac(exp);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
