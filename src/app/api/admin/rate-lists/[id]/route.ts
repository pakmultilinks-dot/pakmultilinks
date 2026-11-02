import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import {
  apiFailure,
  jsonError,
  noStoreHeaders,
  readJson,
  requireAdminRequest,
  serialize,
} from "@/app/api/_utils";
import { deleteBlobs, isVercelBlobUrl } from "@/lib/blob";
import { requireDatabase } from "@/lib/db";
import { rateListFileUpdateSchema, validationError } from "@/lib/validation";
import { ensureDocumentLibrarySchema } from "@/lib/rate-lists-server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) {
      return jsonError("Administrator access required.", 401);
    }
    await ensureDocumentLibrarySchema();

    const { id } = await context.params;
    const rawBody = await readJson(request, 8_000);
    const parsed = rateListFileUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), {
        status: 400,
        headers: noStoreHeaders,
      });
    }

    const database = requireDatabase();
    const existing = await database.rateListFile.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Rate list file not found.", 404);
    }

    const data = parsed.data;

    // If making this primary, unset other primary files
    if (data.isPrimary) {
      await database.rateListFile.updateMany({
        where: { id: { not: id }, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updated = await database.rateListFile.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.documentType !== undefined && { documentType: data.documentType }),
        ...(data.coverStyle !== undefined && { coverStyle: data.coverStyle }),
        ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl || null }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.fileName !== undefined && { fileName: data.fileName }),
        ...(data.fileSize !== undefined && { fileSize: data.fileSize }),
        ...(data.pageCount !== undefined && { pageCount: data.pageCount }),
        ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    revalidatePath("/");
    revalidatePath("/rate-list");
    revalidatePath("/admin/rate-lists");

    return NextResponse.json({ file: serialize(updated), success: true }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) {
      return jsonError("Administrator access required.", 401);
    }
    await ensureDocumentLibrarySchema();

    const { id } = await context.params;
    const database = requireDatabase();
    const existing = await database.rateListFile.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Rate list file not found.", 404);
    }

    await database.rateListFile.delete({ where: { id } });

    // Clean up file if it is stored in Vercel Blob
    if (isVercelBlobUrl(existing.fileUrl)) {
      await deleteBlobs([existing.fileUrl]);
    } else if (existing.fileUrl.startsWith("/downloads/")) {
      // If it's a generated or uploaded file (contains timestamp suffix), safely clean up
      const filename = path.basename(existing.fileUrl);
      const isSeedFile = [
        "pak-multilinks-master-rate-list.pdf",
        "rose-petal-rate-list.pdf",
        "fresco-rate-list.pdf",
        "nozomi-rate-list.pdf",
        "germicure-rate-list.pdf",
        "shinewell-rate-list.pdf",
        "sicura-rate-list.pdf",
        "softex-supersoft-rate-list.pdf",
        "glad-rate-list.pdf",
      ].includes(filename);

      if (!isSeedFile) {
        const fullPath = path.join(process.cwd(), "public", "downloads", filename);
        await fs.unlink(fullPath).catch(() => {});
      }
    }

    revalidatePath("/");
    revalidatePath("/rate-list");
    revalidatePath("/admin/rate-lists");

    return NextResponse.json({ ok: true, id }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
