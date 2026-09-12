import { del } from "@vercel/blob";

/**
 * Detects whether a URL is a Vercel Blob Storage URL.
 * Blob URLs follow the pattern: https://<token>.public.blob.vercel-storage.com/...
 */
export function isVercelBlobUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * Deletes one or more Vercel Blob objects by URL.
 * Silently ignores non-blob URLs and deletion failures to avoid blocking
 * the caller (cleanup is best-effort).
 */
export async function deleteBlobs(urls: string[]): Promise<void> {
  const blobUrls = urls.filter(isVercelBlobUrl);
  if (blobUrls.length === 0) return;
  try {
    await del(blobUrls);
  } catch (error) {
    console.error("Blob cleanup failed:", error);
  }
}
