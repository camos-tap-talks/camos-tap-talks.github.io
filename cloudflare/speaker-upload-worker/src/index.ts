type Env = {
  TEMP_UPLOADS: R2Bucket;
  SIGNING_SECRET: string;
  PUBLIC_BASE_URL: string;
  ALLOWED_ORIGINS: string;
};

type SignRequest = {
  filename: string;
  fileType: string;
  fileSize: number;
  target: "speakerImage" | "talkImage";
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const TOKEN_TTL_SECONDS = 10 * 60;

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(request, env, new Response(null, { status: 204 }));
    }

    if (request.method === "POST" && url.pathname === "/sign") {
      return withCors(request, env, await handleSign(request, env, url));
    }

    if (request.method === "PUT" && url.pathname === "/upload") {
      return withCors(request, env, await handleUpload(request, env, url));
    }

    if (request.method === "DELETE" && url.pathname === "/delete") {
      return withCors(request, env, await handleDelete(env, url));
    }

    if (request.method === "GET" && url.pathname.startsWith("/files/")) {
      return withCors(request, env, await handleGetFile(url, env));
    }

    return withCors(request, env, json({ error: "Not found" }, 404));
  },
};

export default worker;

async function handleSign(request: Request, env: Env, url: URL): Promise<Response> {
  const missingConfig = getMissingConfig(env, ["SIGNING_SECRET", "PUBLIC_BASE_URL"]);
  if (missingConfig.length > 0) {
    return json({ error: `Missing worker config: ${missingConfig.join(", ")}` }, 500);
  }

  const body = (await request.json()) as Partial<SignRequest>;
  const fileType = body.fileType ?? "";
  const fileSize = Number(body.fileSize ?? 0);
  const target = body.target === "talkImage" ? "talkImage" : "speakerImage";

  if (!ALLOWED_TYPES.has(fileType)) {
    return json({ error: "Only JPEG/PNG are allowed" }, 415);
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_BYTES) {
    return json({ error: "File size must be <= 10MB" }, 400);
  }

  const ext = fileType === "image/png" ? "png" : "jpg";
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${target}.${ext}`;

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const signedPayload = `${key}\n${fileType}\n${fileSize}\n${exp}`;
  const sig = await hmacBase64Url(env.SIGNING_SECRET, signedPayload);

  const uploadUrl = new URL("/upload", url.origin);
  uploadUrl.searchParams.set("key", key);
  uploadUrl.searchParams.set("type", fileType);
  uploadUrl.searchParams.set("size", String(fileSize));
  uploadUrl.searchParams.set("exp", String(exp));
  uploadUrl.searchParams.set("sig", sig);

  const deletePayload = `${key}\n${exp}\nDELETE`;
  const deleteSig = await hmacBase64Url(env.SIGNING_SECRET, deletePayload);
  const deleteUrl = new URL("/delete", url.origin);
  deleteUrl.searchParams.set("key", key);
  deleteUrl.searchParams.set("exp", String(exp));
  deleteUrl.searchParams.set("sig", deleteSig);

  return json({
    uploadUrl: uploadUrl.toString(),
    deleteUrl: deleteUrl.toString(),
    publicUrl: `${trimTrailingSlash(env.PUBLIC_BASE_URL)}/${key}`,
    method: "PUT",
    headers: {
      "Content-Type": fileType,
    },
  });
}

async function handleUpload(request: Request, env: Env, url: URL): Promise<Response> {
  const key = url.searchParams.get("key") ?? "";
  const fileType = url.searchParams.get("type") ?? "";
  const size = Number(url.searchParams.get("size") ?? "0");
  const exp = Number(url.searchParams.get("exp") ?? "0");
  const sig = url.searchParams.get("sig") ?? "";

  if (!key.startsWith("uploads/") || !ALLOWED_TYPES.has(fileType) || size <= 0 || size > MAX_BYTES) {
    return json({ error: "Invalid upload params" }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(exp) || exp < now) {
    return json({ error: "Signed URL expired" }, 403);
  }

  const expected = await hmacBase64Url(env.SIGNING_SECRET, `${key}\n${fileType}\n${size}\n${exp}`);
  if (!constantTimeEqual(sig, expected)) {
    return json({ error: "Invalid signature" }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.split(";")[0].trim() !== fileType) {
    return json({ error: "Content-Type mismatch" }, 400);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_BYTES || contentLength > size) {
    return json({ error: "Invalid Content-Length" }, 400);
  }

  if (!request.body) {
    return json({ error: "Missing request body" }, 400);
  }

  await env.TEMP_UPLOADS.put(key, request.body, {
    httpMetadata: {
      contentType: fileType,
    },
  });

  return json({ ok: true }, 201);
}

async function handleDelete(env: Env, url: URL): Promise<Response> {
  const key = url.searchParams.get("key") ?? "";
  const exp = Number(url.searchParams.get("exp") ?? "0");
  const sig = url.searchParams.get("sig") ?? "";

  if (!key.startsWith("uploads/")) {
    return json({ error: "Invalid delete params" }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(exp) || exp < now) {
    return json({ error: "Delete URL expired" }, 403);
  }

  const expected = await hmacBase64Url(env.SIGNING_SECRET, `${key}\n${exp}\nDELETE`);
  if (!constantTimeEqual(sig, expected)) {
    return json({ error: "Invalid signature" }, 403);
  }

  await env.TEMP_UPLOADS.delete(key);
  return json({ ok: true }, 200);
}

async function handleGetFile(url: URL, env: Env): Promise<Response> {
  const key = url.pathname.replace(/^\/files\//, "");
  if (!key.startsWith("uploads/")) {
    return json({ error: "Not found" }, 404);
  }

  const object = await env.TEMP_UPLOADS.get(key);
  if (!object || !object.body) {
    return json({ error: "Not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(object.body, {
    status: 200,
    headers,
  });
}

function withCors(request: Request, env: Env, response: Response): Response {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const allowOrigin = allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] ?? "*");

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", allowOrigin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

async function hmacBase64Url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function getMissingConfig(env: Env, keys: Array<keyof Pick<Env, "SIGNING_SECRET" | "PUBLIC_BASE_URL">>): string[] {
  return keys.filter((key) => !env[key] || env[key].trim().length === 0);
}
