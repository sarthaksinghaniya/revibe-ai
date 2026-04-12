"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { analyzeItem } from "@/lib/api";
import { saveLatestAnalysis } from "@/lib/analysisSession";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/heic"];

export function UploadBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile() {
    inputRef.current?.click();
  }

  function onFiles(files: FileList | null) {
    const next = files?.[0] ?? null;
    if (!next) return;
    if (!ACCEPTED.includes(next.type)) {
      setAnalyzeError("Please upload PNG, JPG, WebP, or HEIC image files only.");
      return;
    }
    setFile(next);
    setAnalyzeError(null);
  }

  function clear() {
    setFile(null);
    setAnalyzeError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    if (!file) {
      setAnalyzeError("Please select a file before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);

    const itemName = file.name.replace(/\.[^/.]+$/, "").trim() || "Unknown item";

    try {
      const response = await analyzeItem({
        itemName,
        notes: "Mock upload flow payload from frontend",
      });

      saveLatestAnalysis({
        itemName,
        result: response.data,
        createdAt: new Date().toISOString(),
      });

      router.push("/results");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not analyze right now. Please try again.";
      setAnalyzeError(message);
      console.error("[analyze] POST /api/analyze failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="grid gap-4" aria-busy={isAnalyzing}>
      <Card
        className={cn(
          "relative overflow-hidden p-6 sm:p-8",
          "transition-colors duration-200",
          isDragging ? "ring-2 ring-primary/40" : "ring-1 ring-border",
        )}
      >
        <div
          className={cn(
            "rounded-2xl border border-dashed p-6 sm:p-8",
            "bg-muted/40 border-border",
            isDragging ? "bg-primary/5" : "",
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            onFiles(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
          onClick={pickFile}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") pickFile();
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 ring-1 ring-border grid place-items-center text-primary">
              <Icon name="upload" />
            </div>
            <p className="mt-4 text-sm font-semibold">Drag & drop an image</p>
            <p className="mt-1 text-sm text-foreground/70">
              or click to choose a file (PNG, JPG, WebP).
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload an e-waste image"
          onChange={(e) => onFiles(e.target.files)}
        />

        <p className="mt-4 text-xs text-foreground/60">
          Tip: Use a clear photo in good light for better material and reuse recommendations.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Preview</p>
            <p className="mt-1 text-sm text-foreground/70">
              {file ? (
                <>
                  {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                </>
              ) : (
                "No file selected yet."
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={clear} disabled={!file || isAnalyzing}>
              Clear
            </Button>
            <Button onClick={analyze} disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
        {analyzeError ? (
          <p className="mt-3 text-sm text-rose-700" role="alert">
            {analyzeError}
          </p>
        ) : null}

        <div className="mt-4">
          {previewUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- Blob URL previews aren't compatible with next/image optimization */}
              <img
                src={previewUrl}
                alt="Upload preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="grid place-items-center rounded-2xl bg-muted/50 p-10 ring-1 ring-border">
              <p className="text-sm text-foreground/60">
                Your preview will appear here.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
