# Speaker Upload Worker (Cloudflare R2)

This worker issues short-lived signed upload URLs for speaker image uploads.

## What this does

- Accepts sign requests at POST `/sign`
- Returns a short-lived signed upload URL for PUT `/upload`
- Enforces:
  - MIME type: `image/jpeg` or `image/png`
  - max size: `10MB`
- Stores uploaded files in R2 under `uploads/YYYY-MM-DD/...`

## 0) Create an R2 bucket

Create bucket name:

- `camos-tap-talks-speaker-temp-uploads`

## 1) Configure 30-day auto delete

In Cloudflare dashboard:

- R2 -> your bucket -> Lifecycle rules
- Add rule for prefix: `uploads/`
- Action: Delete objects after `30 days`

## 2) Configure worker settings

Copy the example config and set values.

- file: `wrangler.toml.example`
- set R2 binding `TEMP_UPLOADS`

Set secrets / vars (dashboard or Wrangler):

- `SIGNING_SECRET`: random long string (32+ chars)
- `PUBLIC_BASE_URL`: public base URL for objects, e.g. `https://img.yuesugi.com`
- `ALLOWED_ORIGINS`: comma-separated origins allowed to call this worker
  - example: `https://camos-tap-talks.github.io,https://yuesugi.com`

## 3) Deploy worker

Example commands:

```bash
cd cloudflare/speaker-upload-worker
npx wrangler deploy
```

After deploy, note your worker URL, for example:

- `https://speaker-upload-signer.<account>.workers.dev`

## 4) Configure this Next.js app

In your environment settings (or `.env.local` during local development), set:

```bash
NEXT_PUBLIC_UPLOAD_SIGN_ENDPOINT=https://camos-tap-talks-speaker-worker.yuesugi.workers.dev/sign
```

The speaker room page already calls this endpoint when users pick files.

## 5) CORS and domain notes

- If you expose the worker via custom domain, use that domain in `NEXT_PUBLIC_UPLOAD_SIGN_ENDPOINT`.
- Ensure your site origin is included in `ALLOWED_ORIGINS`.

## API contract expected by frontend

Sign endpoint (`POST /sign`) input:

```json
{
  "filename": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 123456,
  "target": "speakerImage"
}
```

Sign endpoint output:

```json
{
  "uploadUrl": "https://.../upload?...",
  "publicUrl": "https://img.yuesugi.com/uploads/...jpg",
  "method": "PUT",
  "headers": {
    "Content-Type": "image/jpeg"
  }
}
```

## Recommended manual workflow

1. Speaker uploads to temporary cloud storage.
2. You review and download selected images to local.
3. Commit selected images into this repo under `public/`.
4. Delete temporary cloud files (lifecycle rule will also clean up after 30 days).

## Security reminders

- Do not expose `SIGNING_SECRET` in client-side code.
- Keep sign URL token lifetime short (template uses 10 minutes).
- Keep allowed origins strict.
