import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workerRoot = dirname(scriptDir);
const localConfigPath = join(workerRoot, 'wrangler.local.toml');
const devVarsPath = join(workerRoot, '.dev.vars');

const defaults = {
  name: 'my-blog-media-upload',
  routePattern: 'wsmxd.top/upload-worker/*',
  zoneId: '7c6833fe40456a1bf721274795209ac7',
  imageBucket: 'image',
  videoBucket: 'video',
  allowedOrigins: 'http://localhost:3000,https://wsmxd.top',
  publicBaseUrl: 'https://media.wsmxd.top',
  imagePublicBaseUrl: 'https://wsmxd.top/upload-worker',
  videoPublicBaseUrl: 'https://media.wsmxd.top',
  maxUploadMb: '200',
  compatibilityDate: '2026-03-25',
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(label, defaultValue = '') {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  const answer = await rl.question(`${label}${suffix}: `);
  const trimmed = answer.trim();
  return trimmed || defaultValue;
}

function quoted(value) {
  return JSON.stringify(value);
}

try {
  console.log('Configure local worker preferences. Press Enter to accept each default.');

  const config = {
    name: await ask('Worker name', defaults.name),
    routePattern: await ask('Route pattern', defaults.routePattern),
    zoneId: await ask('Zone ID', defaults.zoneId),
    imageBucket: await ask('Image bucket name', defaults.imageBucket),
    videoBucket: await ask('Video bucket name', defaults.videoBucket),
    allowedOrigins: await ask('Allowed origins', defaults.allowedOrigins),
    publicBaseUrl: await ask('Public base URL', defaults.publicBaseUrl),
    imagePublicBaseUrl: await ask('Image public base URL', defaults.imagePublicBaseUrl),
    videoPublicBaseUrl: await ask('Video public base URL', defaults.videoPublicBaseUrl),
    maxUploadMb: await ask('Max upload size (MB)', defaults.maxUploadMb),
    uploadToken: await ask('Local upload token (optional)', ''),
  };

  await mkdir(workerRoot, { recursive: true });

  const wranglerLocalToml = `name = ${quoted(config.name)}
main = "src/index.ts"
compatibility_date = ${quoted(defaults.compatibilityDate)}
workers_dev = false

routes = [
	{ pattern = ${quoted(config.routePattern)}, zone_id = ${quoted(config.zoneId)} }
]

[[r2_buckets]]
binding = "VIDEO_BUCKET"
bucket_name = ${quoted(config.videoBucket)}

[[r2_buckets]]
binding = "IMAGE_BUCKET"
bucket_name = ${quoted(config.imageBucket)}

[vars]
# Comma-separated origins allowed to upload
ALLOWED_ORIGINS = ${quoted(config.allowedOrigins)}
# Public URL prefix for returned object URLs
PUBLIC_BASE_URL = ${quoted(config.publicBaseUrl)}
# Optional per-bucket public URL prefixes.
IMAGE_PUBLIC_BASE_URL = ${quoted(config.imagePublicBaseUrl)}
VIDEO_PUBLIC_BASE_URL = ${quoted(config.videoPublicBaseUrl)}
# Max upload size in MB
MAX_UPLOAD_MB = ${quoted(config.maxUploadMb)}
`;

  await writeFile(localConfigPath, wranglerLocalToml, 'utf8');

  if (config.uploadToken) {
    await writeFile(devVarsPath, `UPLOAD_TOKEN=${config.uploadToken}\n`, 'utf8');
  }

  console.log(`\nWrote ${localConfigPath}`);
  if (config.uploadToken) {
    console.log(`Wrote ${devVarsPath}`);
  } else {
    console.log(`Skipped ${devVarsPath} because no local upload token was provided.`);
  }
  console.log('\nUse worker scripts with the generated local config:');
  console.log('  pnpm --dir worker dev');
  console.log('  pnpm --dir worker deploy');
  console.log('\nIf you need a deployment secret, set UPLOAD_TOKEN with wrangler secret put.');
} finally {
  rl.close();
}