"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Star,
  Sparkles,
  X,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import type { RateListFileRecord } from "@/lib/types";
import { formatFileSize } from "@/lib/rate-lists-server";

interface RateListFilesStripProps {
  files: RateListFileRecord[];
}

export function RateListFilesStrip({ files }: RateListFilesStripProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewerFile, setViewerFile] = useState<RateListFileRecord | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [files]);

  const primaryFile = useMemo(() => {
    return files.find((f) => f.isPrimary) || files[0];
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (activeTab === "all") return files;
    if (activeTab === "catalogues") return files.filter((f) => f.documentType === "CATALOGUE");
    if (activeTab === "rate-lists") return files.filter((f) => f.documentType !== "CATALOGUE");
    if (activeTab === "primary") return files.filter((f) => f.isPrimary);
    return files.filter((f) => f.category.toLowerCase() === activeTab.toLowerCase());
  }, [files, activeTab]);

  if (!files || files.length === 0) return null;

  return (
    <div className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="size-3.5 text-emerald-600" />
            <span>OFFICIAL 2026 DOWNLOADS</span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-content sm:text-3xl">
            Download Official Rate Lists &amp; Catalogues
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm max-w-2xl">
            Verified wholesale price sheets for corporate clients, retail distributors, hotels, hospitals, and educational institutions across Pakistan.
          </p>
        </div>

        {/* Highlighted Primary Action */}
        {primaryFile && (
          <div className="shrink-0">
            <a
              href={primaryFile.fileUrl}
              download={primaryFile.fileName}
              className="commerce-button commerce-button-primary inline-flex items-center gap-2 shadow-md hover:shadow-lg transition"
              title="Download Master Rate List"
            >
              <Download className="size-4" />
              <span>Download Master List ({formatFileSize(primaryFile.fileSize)})</span>
            </a>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-[#0f4c3a] text-white shadow-xs"
              : "border border-line bg-surface text-secondary hover:text-content hover:bg-surface-soft"
          }`}
        >
          All Documents ({files.length})
        </button>
        <button type="button" onClick={() => setActiveTab("catalogues")} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${activeTab === "catalogues" ? "bg-[#0f4c3a] text-white" : "border border-line bg-surface text-secondary"}`}>Catalogues ({files.filter((f) => f.documentType === "CATALOGUE").length})</button>
        <button type="button" onClick={() => setActiveTab("rate-lists")} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${activeTab === "rate-lists" ? "bg-[#0f4c3a] text-white" : "border border-line bg-surface text-secondary"}`}>Rate Lists ({files.filter((f) => f.documentType !== "CATALOGUE").length})</button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab.toLowerCase() === cat.toLowerCase()
                ? "bg-[#0f4c3a] text-white shadow-xs"
                : "border border-line bg-surface text-secondary hover:text-content hover:bg-surface-soft"
            }`}
          >
            {cat} ({files.filter((f) => f.category === cat).length})
          </button>
        ))}
      </div>

      {/* Rate Lists Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              file.isPrimary
                ? "border-emerald-600/40 bg-linear-to-b from-emerald-500/5 to-surface shadow-sm"
                : "border-line bg-surface hover:border-emerald-600/40"
            }`}
          >
            <div>
              {file.documentType === "CATALOGUE" && (
                <div className="mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-soft">
                  <img
                    src={file.coverStyle === "CUSTOM" && file.coverImageUrl ? file.coverImageUrl : file.coverStyle === "CLEANING" ? "/images/catalogues/wipers-catalogue-cover.jpg" : "/images/catalogues/washroom-catalogue-cover.jpg"}
                    alt={`${file.title} cover`}
                    className="size-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              {/* Top Row: Icon & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="grid size-12 place-items-center rounded-xl bg-red-500/10 text-red-600 transition group-hover:scale-105">
                  <FileText className="size-6" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  {file.isPrimary && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-200">
                      <Star className="size-2.5 fill-amber-500 text-amber-500" />
                      Master List
                    </span>
                  )}
                  <span className="rounded-md bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted border border-line">
                    {file.documentType === "CATALOGUE" ? "Catalogue" : "Rate List"}
                  </span>
                </div>
              </div>

              {/* Title & Category */}
              <h3 className="mt-4 text-base font-extrabold text-content group-hover:text-accent transition-colors line-clamp-2">
                {file.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {file.category}
              </p>

              {/* Description */}
              <p className="mt-2.5 text-xs leading-relaxed text-secondary line-clamp-2">
                {file.description || "Official wholesale prices and carton packaging details for corporate purchase."}
              </p>
            </div>

            {/* Bottom Meta & Action Buttons */}
            <div className="mt-5 border-t border-line pt-3.5">
              <div className="flex items-center justify-between text-xs text-muted mb-3 font-medium">
                <span>Size: <strong className="text-content">{formatFileSize(file.fileSize)}</strong></span>
                <span>{file.pageCount ? `${file.pageCount} ${file.pageCount === 1 ? "page" : "pages"}` : "Full catalogue"}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* View Online Button */}
                <button
                  type="button"
                  onClick={() => setViewerFile(file)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2 px-3 text-xs font-bold text-content hover:bg-surface-soft transition active:scale-95 shadow-2xs"
                >
                  <Eye className="size-3.5 text-accent" />
                  <span>Read Online</span>
                </button>

                {/* Direct Download Button */}
                <a
                  href={file.fileUrl}
                  download={file.fileName}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f4c3a] py-2 px-3 text-xs font-bold text-white hover:bg-[#0b3b2c] transition active:scale-95 shadow-xs"
                >
                  <Download className="size-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive PDF Reader Modal */}
      {viewerFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm">
          <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 bg-surface-soft">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-content truncate max-w-md">
                      {viewerFile.title}
                    </h3>
                    {viewerFile.isPrimary && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                        Master List
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {viewerFile.category} • {formatFileSize(viewerFile.fileSize)} • Official Pak Multilinks Document
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={viewerFile.fileUrl}
                  download={viewerFile.fileName}
                  className="commerce-button commerce-button-primary inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold"
                >
                  <Download className="size-3.5" />
                  <span>Download PDF</span>
                </a>
                <a
                  href={viewerFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="commerce-button commerce-button-secondary inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold"
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewerFile(null)}
                  className="rounded-lg p-2 text-muted hover:text-content hover:bg-surface transition"
                  aria-label="Close PDF Viewer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="relative flex-1 bg-zinc-900 overflow-hidden">
              <iframe
                src={`${viewerFile.fileUrl}#toolbar=1`}
                className="size-full border-0"
                title={viewerFile.title}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 bg-surface text-xs text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="size-3.5 text-emerald-600" />
                <span>Wholesale prices confirmed by Pak Multilinks Hygiene. Minimum order: 1 carton.</span>
              </span>
              <button
                type="button"
                onClick={() => setViewerFile(null)}
                className="font-bold text-content hover:underline"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
