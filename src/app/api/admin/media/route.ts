import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import {
  jsonError,
  noStoreHeaders,
  readJson,
  requireAdminRequest,
} from "@/app/api/_utils";
import { deleteBlobs } from "@/lib/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function hasValidSignature(bytes: Uint8Array, mime: keyof typeof imageTypes) {
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }
  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminRequest(request))) {
    return jsonError("Administrator access required.", 401);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 512 * 1024) {
    return jsonError("The upload request is too large. Maximum image size is 5 MB.", 413);
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Select an image to upload.", 400);
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return jsonError("Images must be between 1 byte and 5 MB.", 400);
    }
    if (!(file.type in imageTypes)) {
      return jsonError("Only JPG, PNG, and WebP images are accepted.", 400);
    }

    const mime = file.type as keyof typeof imageTypes;
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidSignature(bytes, mime)) {
      return jsonError("The file content does not match a supported image format.", 400);
    }

    const scope = form.get("scope") === "deals" ? "deals" : "products";
    const filename = `${randomUUID()}.${imageTypes[mime]}`;

    const blob = await put(`${scope}/${filename}`, Buffer.from(bytes), {
      access: "public",
      contentType: mime,
    });

    return NextResponse.json(
      { url: blob.url },
      { status: 201, headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Product media upload failed", error);
    return jsonError("The image could not be uploaded.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdminRequest(request))) {
    return jsonError("Administrator access required.", 401);
  }

  try {
    const body = await readJson(request, 16_000) as { urls?: unknown };
    if (!Array.isArray(body.urls) || body.urls.length === 0) {
      return jsonError("No image URLs provided.", 400);
    }
    const urls = body.urls.filter((u): u is string => typeof u === "string" && u.length > 0);
    if (urls.length > 100) {
      return jsonError("Too many URLs. Maximum 100 per request.", 400);
    }
    await deleteBlobs(urls);
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Blob deletion failed", error);
    return jsonError("Images could not be deleted.", 500);
  }
}
