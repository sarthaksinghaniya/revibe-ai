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
const DEFAULT_CATEGORY = "Utility";

type ReuseAnalysisCard = {
  materialIdentified: string;
  suggestedCategory: string;
  reusePotential: string;
  difficulty: string;
  budgetEstimate: string;
  safetyNote: string;
  quickSummary: string;
};

function inferMaterialFromText(input: string): string {
  const value = input.toLowerCase();
  if (value.includes("keyboard")) return "Keyboard plastic + small electronics";
  if (value.includes("bottle")) return "PET plastic";
  if (value.includes("fan")) return "Motor + metal/plastic housing";
  if (value.includes("motherboard")) return "Electronic circuit board";
  if (value.includes("laptop")) return "Mixed electronics components";
  return input.trim();
}

function mapPotential(score: number): string {
  if (score >= 80) return "High - great reuse opportunity for beginner projects.";
  if (score >= 60) return "Medium - reusable with simple planning.";
  return "Moderate - possible reuse with extra care.";
}

function mapSafetyNote(risk: string): string {
  if (risk.toLowerCase().includes("low")) {
    return "Low risk. Use gloves and basic tools while handling parts.";
  }
  if (risk.toLowerCase().includes("high")) {
    return "Higher risk. Avoid exposed wires and ask for expert help if unsure.";
  }
  return "Handle carefully. Keep sharp tools and exposed circuits away from children.";
}

export function UploadBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");
  const [complexity, setComplexity] = useState("");
  const [budget, setBudget] = useState("");
  const [latestBackendResult, setLatestBackendResult] = useState<{
    itemName: string;
    result: Awaited<ReturnType<typeof analyzeItem>>["data"];
  } | null>(null);
  const [analysisCard, setAnalysisCard] = useState<ReuseAnalysisCard | null>(null);

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
    setMaterial("");
    setCategory("");
    setComplexity("");
    setBudget("");
    setLatestBackendResult(null);
    setAnalysisCard(null);
    setAnalyzeError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    const typedMaterial = material.trim();
    if (!file && !typedMaterial) {
      setAnalyzeError("Please upload an image or type a material to continue.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);

    const itemName =
      typedMaterial ||
      file?.name.replace(/\.[^/.]+$/, "").trim() ||
      "Unknown item";

    const notesParts = [
      file ? "Input method: image upload" : "Input method: manual material",
      category ? `Category: ${category}` : "",
      complexity ? `Complexity: ${complexity}` : "",
      budget.trim() ? `Max budget (INR): ${budget.trim()}` : "",
    ].filter(Boolean);

    try {
      const response = await analyzeItem({
        itemName,
        notes: notesParts.join(" | "),
      });
      const inferredMaterial = typedMaterial ? inferMaterialFromText(typedMaterial) : "";
      const materialIdentified =
        file && typedMaterial
          ? `${response.data.material} (image) + ${inferredMaterial} (typed)`
          : file
            ? response.data.material
            : inferredMaterial || response.data.material;

      const suggestedCategory =
        category ||
        (response.data.ideas[0]?.title?.toLowerCase().includes("decor")
          ? "Home Decor"
          : response.data.ideas[0]?.title?.toLowerCase().includes("art")
            ? "Art & Craft"
            : DEFAULT_CATEGORY);

      const difficulty = complexity || response.data.ideas[0]?.difficulty || "Easy";
      const budgetEstimate =
        budget.trim() || response.data.ideas[0]?.estimatedCost || "₹300 - ₹1200";
      const reusePotential = mapPotential(response.data.sustainabilityScore);
      const safetyNote = mapSafetyNote(response.data.risk);
      const quickSummary =
        response.data.ideas[0]?.description ||
        `You can repurpose ${materialIdentified} into a practical beginner project.`;

      setLatestBackendResult({
        itemName,
        result: response.data,
      });
      setAnalysisCard({
        materialIdentified,
        suggestedCategory,
        reusePotential,
        difficulty,
        budgetEstimate,
        safetyNote,
        quickSummary,
      });
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

  function startProject() {
    if (!latestBackendResult) return;
    saveLatestAnalysis({
      itemName: latestBackendResult.itemName,
      result: latestBackendResult.result,
      createdAt: new Date().toISOString(),
    });
    router.push("/project-guide");
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
        <div className="grid gap-4">
          <div>
            <label
              htmlFor="material-input"
              className="text-sm font-semibold text-foreground"
            >
              What material do you want to reuse?
            </label>
            <input
              id="material-input"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Example: old keyboard, plastic bottle, broken fan, laptop motherboard"
              className="mt-2 h-11 w-full rounded-xl bg-card px-4 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-2 text-xs text-foreground/60">
              You can either upload an image or type the material manually.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="category-select"
                className="text-xs font-medium text-foreground/70"
              >
                Category (optional)
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl bg-card px-3 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select category</option>
                <option value="Home Decor">Home Decor</option>
                <option value="Education">Education</option>
                <option value="Utility">Utility</option>
                <option value="Electronics">Electronics</option>
                <option value="Art & Craft">Art & Craft</option>
                <option value="Storage">Storage</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="complexity-select"
                className="text-xs font-medium text-foreground/70"
              >
                Complexity (optional)
              </label>
              <select
                id="complexity-select"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl bg-card px-3 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select complexity</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="budget-input"
                className="text-xs font-medium text-foreground/70"
              >
                Budget (optional)
              </label>
              <input
                id="budget-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                inputMode="numeric"
                placeholder="Enter max budget in ₹"
                className="mt-1 h-11 w-full rounded-xl bg-card px-3 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="my-5 h-px bg-border/80" />

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Preview</p>
            <p className="mt-1 text-sm text-foreground/70">
              {file ? (
                <>
                  {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                </>
              ) : (
                "No file selected yet. You can still continue with typed material."
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={clear} disabled={!file || isAnalyzing}>
              Clear
            </Button>
            <Button onClick={analyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing...
                </span>
              ) : (
                "Analyze"
              )}
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

        {analysisCard ? (
          <Card className="mt-5 p-5">
            <p className="text-sm font-semibold">AI Reuse Analysis</p>
            <div className="mt-3 grid gap-2 text-sm text-foreground/80">
              <p>
                <span className="font-semibold">Material identified:</span>{" "}
                {analysisCard.materialIdentified}
              </p>
              <p>
                <span className="font-semibold">Suggested category:</span>{" "}
                {analysisCard.suggestedCategory}
              </p>
              <p>
                <span className="font-semibold">Reuse potential:</span>{" "}
                {analysisCard.reusePotential}
              </p>
              <p>
                <span className="font-semibold">Difficulty:</span> {analysisCard.difficulty}
              </p>
              <p>
                <span className="font-semibold">Budget estimate:</span>{" "}
                {analysisCard.budgetEstimate}
              </p>
              <p>
                <span className="font-semibold">Safety note:</span> {analysisCard.safetyNote}
              </p>
              <p>
                <span className="font-semibold">Quick summary:</span>{" "}
                {analysisCard.quickSummary}
              </p>
            </div>
            <div className="mt-4">
              <Button onClick={startProject}>Start Project</Button>
            </div>
          </Card>
        ) : null}
      </Card>
    </div>
  );
}
