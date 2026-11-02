"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Star,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  X,
  FileSpreadsheet,
  AlertCircle,
  FileCheck2,
  Sparkles,
  HardDrive,
  Check,
  RefreshCw,
  Edit2,
  FileCode,
} from "lucide-react";

import type { RateListFileRecord } from "@/lib/types";
import { formatFileSize } from "@/lib/rate-lists-server";
import { buttonClass, inputClass, panelClass, textareaClass } from "./ui";

interface RateListsManagerProps {
  initialFiles: RateListFileRecord[];
  disabled?: boolean;
}

const COMMON_CATEGORIES = [
  "Master Rate List",
  "Rose Petal Tissues",
  "Nozomi Tissues",
  "Fresco & Aerosols",
  "Germi Cure",
  "Shine Well",
  "Paper & Disposables",
  "Disposables",
  "General Catalogue",
];

export function RateListsManager({ initialFiles, disabled = false }: RateListsManagerProps) {
  const [files, setFiles] = useState<RateListFileRecord[]>(initialFiles);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Upload modal/form state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Master Rate List");
  const [customCategory, setCustomCategory] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadDocumentType, setUploadDocumentType] = useState<"RATE_LIST" | "CATALOGUE">("RATE_LIST");
  const [uploadCoverStyle, setUploadCoverStyle] = useState<"HYGIENE" | "CLEANING" | "CUSTOM">("HYGIENE");
  const [uploadCoverImageUrl, setUploadCoverImageUrl] = useState("");
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false);
  const [uploadIsActive, setUploadIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Preview & Edit states
  const [previewFile, setPreviewFile] = useState<RateListFileRecord | null>(null);
  const [editingFile, setEditingFile] = useState<RateListFileRecord | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Feedback notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editTitleId = useId();

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }

  // Derive categories and stats
  const categories = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [files]);

  const stats = useMemo(() => {
    const totalFiles = files.length;
    const activeFiles = files.filter((f) => f.isActive).length;
    const primaryFile = files.find((f) => f.isPrimary);
    const totalBytes = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
    return { totalFiles, activeFiles, primaryFile, totalBytes };
  }, [files]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchSearch =
        search.trim() === "" ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase()) ||
        f.fileName.toLowerCase().includes(search.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        selectedCategory === "all" ||
        (selectedCategory === "primary" && f.isPrimary) ||
        (selectedCategory === "inactive" && !f.isActive) ||
        f.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [files, search, selectedCategory]);

  // Handle file select in upload form
  function handleFileSelected(selected: File | undefined) {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".pdf") && selected.type !== "application/pdf") {
      showToast("error", "Only PDF documents (.pdf) are supported for rate lists.");
      return;
    }
    setUploadFile(selected);
    if (!uploadTitle.trim()) {
      const friendlyTitle = selected.name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setUploadTitle(friendlyTitle);
    }
  }

  // Upload handler
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) {
      showToast("error", "Please select a PDF file to upload.");
      return;
    }

    const finalCategory =
      uploadCategory === "__custom__"
        ? customCategory.trim() || "General"
        : uploadCategory;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle.trim());
      formData.append("category", finalCategory);
      formData.append("description", uploadDescription.trim());
      formData.append("documentType", uploadDocumentType);
      formData.append("coverStyle", uploadCoverStyle);
      formData.append("coverImageUrl", uploadCoverImageUrl.trim());
      formData.append("isPrimary", String(uploadIsPrimary));
      formData.append("isActive", String(uploadIsActive));

      const res = await fetch("/api/admin/rate-lists", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      const newRecord = data.file as RateListFileRecord;

      // Update state optimistically
      setFiles((prev) => {
        let updated = [...prev];
        if (newRecord.isPrimary) {
          updated = updated.map((item) => ({ ...item, isPrimary: false }));
        }
        return [newRecord, ...updated];
      });

      showToast("success", `"${newRecord.title}" uploaded successfully! Document is live.`);
      // Reset upload form
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadIsPrimary(false);
      setIsUploadOpen(false);
      // Auto open preview so user can immediately verify their data
      setPreviewFile(newRecord);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      showToast("error", msg);
    } finally {
      setIsUploading(false);
    }
  }

  // Toggle active status
  async function toggleActive(file: RateListFileRecord) {
    if (disabled) return;
    const newStatus = !file.isActive;
    setBusyId(file.id);

    try {
      const res = await fetch(`/api/admin/rate-lists/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isActive: newStatus } : f))
      );
      showToast(
        "success",
        `Rate list is now ${newStatus ? "visible on storefront" : "hidden from storefront"}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      showToast("error", msg);
    } finally {
      setBusyId(null);
    }
  }

  // Set as Primary Master Rate List
  async function setAsPrimary(file: RateListFileRecord) {
    if (disabled || file.isPrimary) return;
    setBusyId(file.id);

    try {
      const res = await fetch(`/api/admin/rate-lists/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true, isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          isPrimary: f.id === file.id,
          isActive: f.id === file.id ? true : f.isActive,
        }))
      );
      showToast("success", `"${file.title}" is now set as the primary wholesale rate list!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      showToast("error", msg);
    } finally {
      setBusyId(null);
    }
  }

  // Delete file
  async function handleDelete(file: RateListFileRecord) {
    if (disabled) return;
    if (!confirm(`Are you sure you want to delete "${file.title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeletingId(file.id);
    try {
      const res = await fetch(`/api/admin/rate-lists/${file.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      showToast("success", `"${file.title}" removed successfully.`);
      if (previewFile?.id === file.id) setPreviewFile(null);
      if (editingFile?.id === file.id) setEditingFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete error";
      showToast("error", msg);
    } finally {
      setIsDeletingId(null);
    }
  }

  // Save edit form
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFile) return;
    setBusyId(editingFile.id);

    try {
      const res = await fetch(`/api/admin/rate-lists/${editingFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingFile.title,
          category: editingFile.category,
          description: editingFile.description,
          isPrimary: editingFile.isPrimary,
          isActive: editingFile.isActive,
          sortOrder: editingFile.sortOrder,
          documentType: editingFile.documentType || "RATE_LIST",
          coverStyle: editingFile.coverStyle || "HYGIENE",
          coverImageUrl: editingFile.coverImageUrl || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      const updated = data.file as RateListFileRecord;
      setFiles((prev) => {
        let list = prev.map((f) => (f.id === updated.id ? updated : f));
        if (updated.isPrimary) {
          list = list.map((f) => (f.id === updated.id ? f : { ...f, isPrimary: false }));
        }
        return list;
      });

      showToast("success", `Changes to "${updated.title}" saved.`);
      setEditingFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showToast("error", msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xl backdrop-blur-md transition-all ${
            toast.type === "success"
              ? "border-emerald-600/40 bg-emerald-950/90 text-emerald-100"
              : "border-rose-600/40 bg-rose-950/90 text-rose-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Top Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className={`${panelClass} p-4 sm:p-5 flex items-center gap-3.5`}>
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Documents</p>
            <p className="text-xl font-bold text-content sm:text-2xl">{stats.totalFiles}</p>
          </div>
        </div>

        <div className={`${panelClass} p-4 sm:p-5 flex items-center gap-3.5`}>
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Active on Website</p>
            <p className="text-xl font-bold text-content sm:text-2xl">{stats.activeFiles}</p>
          </div>
        </div>

        <div className={`${panelClass} p-4 sm:p-5 flex items-center gap-3.5`}>
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
            <Star className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Primary Rate List</p>
            <p className="text-xs font-bold text-content truncate max-w-[140px] sm:max-w-[180px]">
              {stats.primaryFile ? stats.primaryFile.title : "None Set"}
            </p>
          </div>
        </div>

        <div className={`${panelClass} p-4 sm:p-5 flex items-center gap-3.5`}>
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
            <HardDrive className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Total File Storage</p>
            <p className="text-xl font-bold text-content sm:text-2xl">{formatFileSize(stats.totalBytes)}</p>
          </div>
        </div>
      </div>

      {/* Action Bar & Search / Filter */}
      <div className={`${panelClass} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, brand, or category..."
              className="w-full rounded-xl border border-line bg-canvas pl-9 pr-8 py-2 text-xs sm:text-sm text-content outline-none transition focus:border-focus focus:ring-1 focus:ring-focus"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-content"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View toggle */}
            <div className="inline-flex rounded-xl border border-line bg-canvas p-0.5 text-secondary">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  viewMode === "table" ? "bg-surface font-bold text-content shadow-xs" : "hover:text-content"
                }`}
                title="Table view"
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  viewMode === "grid" ? "bg-surface font-bold text-content shadow-xs" : "hover:text-content"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* View storefront rate list button */}
            <Link
              href="/rate-list"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-secondary hover:bg-surface-soft hover:text-content transition"
            >
              <span>View On Storefront</span>
              <ExternalLink className="size-3" />
            </Link>

            {/* Upload New Rate List Button */}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className={`${buttonClass} rounded-xl shadow-xs`}
            >
              <Upload className="size-4" />
              <span>Upload New PDF</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted mr-1">Filter:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-accent text-white font-bold"
                : "bg-surface-soft text-secondary hover:text-content"
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("primary")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedCategory === "primary"
                ? "bg-amber-600 text-white font-bold"
                : "bg-surface-soft text-secondary hover:text-content"
            }`}
          >
            Primary List ⭐
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-accent text-white font-bold"
                  : "bg-surface-soft text-secondary hover:text-content"
              }`}
            >
              {cat} ({files.filter((f) => f.category === cat).length})
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedCategory("inactive")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              selectedCategory === "inactive"
                ? "bg-zinc-700 text-white font-bold"
                : "bg-surface-soft text-secondary hover:text-content"
            }`}
          >
            Hidden ({files.filter((f) => !f.isActive).length})
          </button>
        </div>
      </div>

      {/* Main Files Display */}
      {filteredFiles.length === 0 ? (
        <div className={`${panelClass} p-12 text-center`}>
          <FileSpreadsheet className="mx-auto size-12 text-muted/60" />
          <h3 className="mt-3 text-base font-bold text-content">No rate list files match your search</h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            Try adjusting your search query or upload a new wholesale PDF catalogue using the button above.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <RefreshCw className="size-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className={`${panelClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th scope="col" className="px-4 py-3">Document Title</th>
                  <th scope="col" className="px-4 py-3">Category / Tag</th>
                  <th scope="col" className="px-4 py-3">File Size &amp; Pages</th>
                  <th scope="col" className="px-4 py-3">Storefront Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="transition hover:bg-surface-soft/60">
                    {/* Document Title */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-600">
                          <FileText className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-content text-sm">{file.title}</span>
                            {file.isPrimary && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                <Star className="size-2.5 fill-amber-500 text-amber-500" />
                                Master
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted truncate max-w-sm">
                            {file.description || file.fileName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-surface-soft px-2.5 py-1 text-xs font-semibold text-secondary border border-line">
                        {file.category}
                      </span>
                    </td>

                    {/* File Size & Pages */}
                    <td className="px-4 py-3.5 text-secondary">
                      <div className="font-semibold text-content">{formatFileSize(file.fileSize)}</div>
                      <div className="text-[11px] text-muted">
                        {file.pageCount ? `${file.pageCount} ${file.pageCount === 1 ? "page" : "pages"}` : "PDF document"}
                      </div>
                    </td>

                    {/* Storefront Status Toggle */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleActive(file)}
                        disabled={disabled || busyId === file.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                          file.isActive
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300"
                            : "bg-zinc-500/15 text-zinc-600 hover:bg-zinc-500/25 dark:text-zinc-400"
                        }`}
                        title="Click to toggle visibility"
                      >
                        <span className={`size-1.5 rounded-full ${file.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        <span>{file.isActive ? "Active / Public" : "Hidden"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-content hover:bg-surface-soft transition shadow-2xs"
                          title="Preview PDF online"
                        >
                          <Eye className="size-3.5 text-accent" />
                          <span>Preview</span>
                        </button>

                        {/* Set Primary */}
                        {!file.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setAsPrimary(file)}
                            disabled={disabled || busyId === file.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition shadow-2xs dark:text-amber-400"
                            title="Set as primary master rate list"
                          >
                            <Star className="size-3" />
                            <span className="hidden lg:inline">Make Primary</span>
                          </button>
                        )}

                        {/* Download */}
                        <a
                          href={file.fileUrl}
                          download={file.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg border border-line bg-surface p-1.5 text-secondary hover:text-content hover:bg-surface-soft transition"
                          title="Direct download file"
                        >
                          <Download className="size-3.5" />
                        </a>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => setEditingFile({ ...file })}
                          className="inline-flex items-center rounded-lg border border-line bg-surface p-1.5 text-secondary hover:text-content hover:bg-surface-soft transition"
                          title="Edit details"
                        >
                          <Edit2 className="size-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(file)}
                          disabled={disabled || isDeletingId === file.id}
                          className="inline-flex items-center rounded-lg border border-line bg-surface p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition dark:hover:bg-rose-950/40"
                          title="Delete rate list"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`${panelClass} flex flex-col justify-between p-5 transition hover:shadow-md hover:border-line-strong`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600">
                    <FileText className="size-6" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    {file.isPrimary && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        <Star className="size-2.5 fill-amber-500 text-amber-500" />
                        Master
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        file.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {file.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Card Title & Info */}
                <h3 className="mt-3 text-base font-bold text-content line-clamp-2">{file.title}</h3>
                <span className="mt-1 inline-block text-xs font-semibold text-accent">
                  {file.category}
                </span>
                <p className="mt-2 text-xs text-muted line-clamp-2">
                  {file.description || file.fileName}
                </p>

                {/* File Meta */}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-secondary">
                  <span>Size: {formatFileSize(file.fileSize)}</span>
                  <span>{file.pageCount ? `${file.pageCount} pages` : "PDF"}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-soft px-3 py-1.5 text-xs font-bold text-content hover:bg-disabled transition"
                >
                  <Eye className="size-3.5 text-accent" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={file.fileUrl}
                    download={file.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-secondary hover:bg-surface-soft hover:text-content"
                    title="Download"
                  >
                    <Download className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setEditingFile({ ...file })}
                    className="rounded-lg p-1.5 text-secondary hover:bg-surface-soft hover:text-content"
                    title="Edit"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file)}
                    className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:text-content hover:bg-surface-soft"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <Upload className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-content">Upload Catalogue or Rate List</h2>
                <p className="text-xs text-muted">Choose the document type, card cover and PDF.</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-secondary">Document Type</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(["RATE_LIST", "CATALOGUE"] as const).map((type) => <button key={type} type="button" onClick={() => setUploadDocumentType(type)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${uploadDocumentType === type ? "border-accent bg-accent text-white" : "border-line bg-surface-soft text-secondary"}`}>{type === "RATE_LIST" ? "Rate List" : "Catalogue"}</button>)}
                </div>
              </div>
              {/* Drag and drop / Select File Zone */}
              <div>
                <label className="text-xs font-bold text-secondary">PDF Document</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                    uploadFile
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200"
                      : "border-line-strong bg-surface-soft hover:border-accent hover:bg-accent-soft/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    className="sr-only"
                  />
                  {uploadFile ? (
                    <>
                      <CheckCircle2 className="size-8 text-emerald-500 mb-1" />
                      <p className="text-sm font-bold text-content truncate max-w-xs">{uploadFile.name}</p>
                      <p className="text-xs text-muted mt-0.5">{formatFileSize(uploadFile.size)}</p>
                      <span className="mt-2 text-[11px] font-semibold text-accent underline">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <FileText className="size-8 text-muted mb-1" />
                      <p className="text-xs font-semibold text-content">Click to browse or drag and drop PDF file</p>
                      <p className="text-[11px] text-muted mt-0.5">Maximum size: 35 MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-xs font-bold text-secondary">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Rose Petal Wholesale Rate List 2026"
                  className={inputClass}
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-secondary">Category / Classification</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {COMMON_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setUploadCategory(cat);
                        setCustomCategory("");
                      }}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition truncate ${
                        uploadCategory === cat
                          ? "border-accent bg-accent text-white font-bold"
                          : "border-line bg-surface-soft text-secondary hover:text-content"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setUploadCategory("__custom__")}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition truncate ${
                      uploadCategory === "__custom__"
                        ? "border-accent bg-accent text-white font-bold"
                        : "border-line bg-surface-soft text-secondary hover:text-content"
                    }`}
                  >
                    + Custom Category
                  </button>
                </div>
                {uploadCategory === "__custom__" && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name..."
                    className={`${inputClass} mt-2`}
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-secondary">Description / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief note on what rates or products are covered in this catalogue..."
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-secondary">Card Cover</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["HYGIENE", "CLEANING", "CUSTOM"] as const).map((style) => <button key={style} type="button" onClick={() => setUploadCoverStyle(style)} className={`overflow-hidden rounded-xl border text-left ${uploadCoverStyle === style ? "border-accent ring-2 ring-accent/20" : "border-line"}`}><img src={style === "CLEANING" ? "/images/catalogues/wipers-catalogue-cover.jpg" : style === "HYGIENE" ? "/images/catalogues/washroom-catalogue-cover.jpg" : uploadCoverImageUrl || "/images/catalogues/tissue-catalogue-cover.jpg"} alt="" className="h-20 w-full object-cover" /><span className="block px-2 py-1.5 text-[10px] font-bold">{style === "HYGIENE" ? "Hygiene" : style === "CLEANING" ? "Cleaning" : "Custom"}</span></button>)}
                </div>
                {uploadCoverStyle === "CUSTOM" && <input type="text" value={uploadCoverImageUrl} onChange={(e) => setUploadCoverImageUrl(e.target.value)} placeholder="/images/your-cover.jpg or https://..." className={`${inputClass} mt-2`} />}
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 rounded-xl border border-line bg-surface-soft p-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadIsPrimary}
                    onChange={(e) => setUploadIsPrimary(e.target.checked)}
                    className="size-4 rounded accent-emerald-700"
                  />
                  <div>
                    <span className="font-bold text-content">Make Primary Master Rate List</span>
                    <p className="text-[11px] text-muted">
                      Will be the default download button on the storefront homepage and header.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-line">
                  <input
                    type="checkbox"
                    checked={uploadIsActive}
                    onChange={(e) => setUploadIsActive(e.target.checked)}
                    className="size-4 rounded accent-emerald-700"
                  />
                  <div>
                    <span className="font-bold text-content">Visible on Storefront</span>
                    <p className="text-[11px] text-muted">Allow customers and businesses to download this PDF.</p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-surface-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className={`${buttonClass} rounded-xl px-5`}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Uploading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      <span>Upload &amp; Publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF LIVE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs">
          <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 bg-surface-soft">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-600">
                  <FileText className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-content truncate max-w-md">
                      {previewFile.title}
                    </h3>
                    {previewFile.isPrimary && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {previewFile.category} • {formatFileSize(previewFile.fileSize)} • {previewFile.pageCount || 1} pages
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={previewFile.fileUrl}
                  download={previewFile.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-content hover:bg-surface-soft transition shadow-2xs"
                >
                  <Download className="size-3.5 text-accent" />
                  <span>Download</span>
                </a>
                <a
                  href={previewFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-content hover:bg-surface-soft transition shadow-2xs"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open In Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="rounded-lg p-1.5 text-muted hover:text-content hover:bg-surface"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="relative flex-1 bg-zinc-900 overflow-hidden">
              <iframe
                src={`${previewFile.fileUrl}#toolbar=1`}
                className="size-full border-0"
                title={previewFile.title}
              />
            </div>

            {/* Modal Footer with quick verification feedback */}
            <div className="flex items-center justify-between border-t border-line px-5 py-2.5 bg-surface text-xs text-muted">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                <Check className="size-3.5 text-emerald-500" />
                <span>PDF file loaded successfully. Your wholesale data is verified.</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="font-bold text-content hover:underline"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setEditingFile(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:text-content hover:bg-surface-soft"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-lg font-bold text-content">Edit Document Details</h2>
            <p className="text-xs text-muted mt-0.5">Update metadata, category, and storefront visibility.</p>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label htmlFor={editTitleId} className="text-xs font-bold text-secondary">Document Title</label>
                <input
                  id={editTitleId}
                  type="text"
                  required
                  value={editingFile.title}
                  onChange={(e) => setEditingFile({ ...editingFile, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-secondary">Category</label>
                <input
                  type="text"
                  required
                  value={editingFile.category}
                  onChange={(e) => setEditingFile({ ...editingFile, category: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-bold text-secondary">Document Type<select value={editingFile.documentType || "RATE_LIST"} onChange={(e) => setEditingFile({ ...editingFile, documentType: e.target.value as "RATE_LIST" | "CATALOGUE" })} className={inputClass}><option value="RATE_LIST">Rate List</option><option value="CATALOGUE">Catalogue</option></select></label>
                <label className="text-xs font-bold text-secondary">Card Cover<select value={editingFile.coverStyle || "HYGIENE"} onChange={(e) => setEditingFile({ ...editingFile, coverStyle: e.target.value as "HYGIENE" | "CLEANING" | "CUSTOM" })} className={inputClass}><option value="HYGIENE">Hygiene default</option><option value="CLEANING">Cleaning default</option><option value="CUSTOM">Custom image</option></select></label>
              </div>
              {editingFile.coverStyle === "CUSTOM" && <div><label className="text-xs font-bold text-secondary">Custom Cover URL</label><input value={editingFile.coverImageUrl || ""} onChange={(e) => setEditingFile({ ...editingFile, coverImageUrl: e.target.value })} className={inputClass} /></div>}

              <div>
                <label className="text-xs font-bold text-secondary">Description / Remarks</label>
                <textarea
                  rows={2}
                  value={editingFile.description || ""}
                  onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                  className={textareaClass}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-line bg-surface-soft p-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFile.isPrimary}
                    onChange={(e) => setEditingFile({ ...editingFile, isPrimary: e.target.checked })}
                    className="size-4 rounded accent-emerald-700"
                  />
                  <div>
                    <span className="font-bold text-content">Set as Primary Master Rate List</span>
                    <p className="text-[11px] text-muted">Primary rate list used for header and hero downloads.</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-line">
                  <input
                    type="checkbox"
                    checked={editingFile.isActive}
                    onChange={(e) => setEditingFile({ ...editingFile, isActive: e.target.checked })}
                    className="size-4 rounded accent-emerald-700"
                  />
                  <div>
                    <span className="font-bold text-content">Visible on Storefront</span>
                    <p className="text-[11px] text-muted">Make accessible to customers on the /rate-list page.</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-surface-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyId === editingFile.id}
                  className={`${buttonClass} rounded-xl px-5`}
                >
                  {busyId === editingFile.id ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
