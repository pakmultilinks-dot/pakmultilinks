import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument } from "pdf-lib";

import {
  apiFailure,
  jsonError,
  noStoreHeaders,
  readJson,
  requireAdminRequest,
  serialize,
} from "@/app/api/_utils";
import { requireDatabase } from "@/lib/db";
import { ensureDocumentLibrarySchema, slugifyTitle } from "@/lib/rate-lists-server";
import { rateListFileInputSchema, validationError } from "@/lib/validation";

const MAX_PDF_SIZE = 35 * 1024 * 1024; // 35 MB

function hasBlobCredentials(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && (process.env.storeId || process.env.BLOB_STORE_ID))
  );
}

function isPdfBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46    // F
  );
}

function sanitizePdfFileName(rawName: string): string {
  const base = rawName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "rate-list"}-${Date.now().toString(36)}.pdf`;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) {
      return jsonError("Administrator access required.", 401);
    }
    await ensureDocumentLibrarySchema();
    const database = requireDatabase();
    const files = await database.rateListFile.findMany({
      orderBy: [
        { isPrimary: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json({ files: serialize(files) }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) {
      return jsonError("Administrator access required.", 401);
    }
    await ensureDocumentLibrarySchema();

    const contentType = request.headers.get("content-type") || "";
    const database = requireDatabase();

    // 1. Handling multipart/form-data upload (File PDF)
    if (contentType.includes("multipart/form-data")) {
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (Number.isFinite(contentLength) && contentLength > MAX_PDF_SIZE + 1024 * 1024) {
        return jsonError("The upload request is too large. Maximum PDF size is 35 MB.", 413);
      }

      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return jsonError("Please select a PDF file to upload.", 400);
      }

      if (file.size <= 0 || file.size > MAX_PDF_SIZE) {
        return jsonError("PDF file must be between 1 byte and 35 MB.", 400);
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!isPdfBytes(bytes)) {
        return jsonError("The uploaded file does not match a valid PDF document format (%PDF).", 400);
      }

      let pageCount: number | null = null;
      try {
        const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        pageCount = pdfDoc.getPageCount();
      } catch (pdfErr) {
        console.warn("Could not parse PDF page count:", pdfErr);
      }

      const originalName = file.name || "rate-list.pdf";
      const sanitizedName = sanitizePdfFileName(originalName);
      let fileUrl: string;

      if (hasBlobCredentials()) {
        try {
          const blob = await put(`rate-lists/${sanitizedName}`, Buffer.from(bytes), {
            access: "public",
            contentType: "application/pdf",
            addRandomSuffix: false,
          });
          fileUrl = blob.url;
        } catch (blobError) {
          console.error("Vercel Blob PDF upload failed, falling back to local:", blobError);
          const downloadsDir = path.join(process.cwd(), "public", "downloads");
          await fs.mkdir(downloadsDir, { recursive: true });
          const filePath = path.join(downloadsDir, sanitizedName);
          await fs.writeFile(filePath, Buffer.from(bytes));
          fileUrl = `/downloads/${sanitizedName}`;
        }
      } else {
        const downloadsDir = path.join(process.cwd(), "public", "downloads");
        await fs.mkdir(downloadsDir, { recursive: true });
        const filePath = path.join(downloadsDir, sanitizedName);
        await fs.writeFile(filePath, Buffer.from(bytes));
        fileUrl = `/downloads/${sanitizedName}`;
      }

      const rawTitle = form.get("title");
      const title =
        typeof rawTitle === "string" && rawTitle.trim().length > 0
          ? rawTitle.trim()
          : originalName.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");

      const rawCategory = form.get("category");
      const category =
        typeof rawCategory === "string" && rawCategory.trim().length > 0
          ? rawCategory.trim()
          : "Master Rate List";

      const rawDescription = form.get("description");
      const description =
        typeof rawDescription === "string" && rawDescription.trim().length > 0
          ? rawDescription.trim()
          : null;

      const isPrimary = form.get("isPrimary") === "true";
      const isActive = form.get("isActive") !== "false";
      const documentType = form.get("documentType") === "CATALOGUE" ? "CATALOGUE" : "RATE_LIST";
      const coverStyleValue = form.get("coverStyle");
      const coverStyle = coverStyleValue === "CLEANING" || coverStyleValue === "CUSTOM" ? coverStyleValue : "HYGIENE";
      const rawCoverImageUrl = form.get("coverImageUrl");
      const coverImageUrl = typeof rawCoverImageUrl === "string" && rawCoverImageUrl.trim() ? rawCoverImageUrl.trim() : null;
      const sortOrder = Number(form.get("sortOrder")) || 0;

      if (isPrimary) {
        await database.rateListFile.updateMany({
          where: { isPrimary: true },
          data: { isPrimary: false },
        });
      }

      let slug = slugifyTitle(title);
      const existingSlug = await database.rateListFile.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const record = await database.rateListFile.create({
        data: {
          title,
          slug,
          description,
          category,
          documentType,
          coverStyle,
          coverImageUrl,
          fileUrl,
          fileName: sanitizedName,
          fileSize: bytes.length,
          pageCount: pageCount || 1,
          isPrimary,
          isActive,
          sortOrder,
        },
      });

      revalidatePath("/");
      revalidatePath("/rate-list");
      revalidatePath("/admin/rate-lists");

      return NextResponse.json(
        { file: serialize(record), success: true },
        { status: 201, headers: noStoreHeaders }
      );
    }

    // 2. Handling JSON payload (e.g. adding an existing or external URL)
    const rawBody = await readJson(request, 16_000);
    const parsed = rateListFileInputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), {
        status: 400,
        headers: noStoreHeaders,
      });
    }

    const data = parsed.data;
    if (data.isPrimary) {
      await database.rateListFile.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    let slug = slugifyTitle(data.title);
    const existingSlug = await database.rateListFile.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const record = await database.rateListFile.create({
      data: {
        title: data.title,
        slug,
        description: data.description || null,
        category: data.category,
        documentType: data.documentType,
        coverStyle: data.coverStyle,
        coverImageUrl: data.coverImageUrl || null,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        pageCount: data.pageCount || 1,
        isPrimary: data.isPrimary,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/");
    revalidatePath("/rate-list");
    revalidatePath("/admin/rate-lists");

    return NextResponse.json(
      { file: serialize(record), success: true },
      { status: 201, headers: noStoreHeaders }
    );
  } catch (error) {
    return apiFailure(error);
  }
}
