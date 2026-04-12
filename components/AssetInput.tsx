"use client";

import { useState, useRef, useCallback } from "react";
import type { CampaignBrief, AssetImage } from "@/lib/types";
import { detectPlatformSpec, getPrimaryFieldLimit } from "@/lib/platformSpecs";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_MB = 5;

interface AssetInputProps {
  brief: CampaignBrief;
  onSubmit: (assetText: string, images: AssetImage[]) => void;
}

export default function AssetInput({ brief, onSubmit }: AssetInputProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<AssetImage[]>([]);

  const platformSpec = detectPlatformSpec(brief.assetType);
  const charLimit = platformSpec ? getPrimaryFieldLimit(platformSpec) : null;
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} is too large (max ${MAX_SIZE_MB}MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Strip "data:<type>;base64," prefix to get raw base64
        const base64 = dataUrl.split(",")[1];
        setImages((prev) => [
          ...prev,
          {
            base64,
            mediaType: file.type as AssetImage["mediaType"],
            name: file.name,
            previewUrl: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim(), images);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-semibold text-neutral-100">Paste Your Asset</h2>
          {platformSpec && (
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-lg whitespace-nowrap flex-shrink-0">
              {platformSpec.displayName}
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-400">
          Paste the {brief.assetType} copy you want to optimize, and optionally attach images.
          The virtual audience will evaluate and iteratively improve it.
        </p>
        {platformSpec && charLimit && (
          <div className="mt-3 p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-xs space-y-1">
            <p className="text-neutral-400 font-medium">{platformSpec.displayName} — Key Limits</p>
            {platformSpec.fields.slice(0, 4).map((f) => (
              <div key={f.name} className="flex items-center justify-between">
                <span className="text-neutral-500">{f.name}</span>
                <span className={`font-mono ${f.maxChars > 0 ? "text-neutral-400" : "text-neutral-600"}`}>
                  {f.maxChars > 0
                    ? `${f.recommended ? `~${f.recommended} rec / ` : ""}${f.maxChars} max`
                    : "no limit"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brief summary */}
      <div className="mb-6 p-4 bg-neutral-800 border border-neutral-700 rounded-xl">
        <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3">Campaign Brief</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            ["Asset Type", brief.assetType],
            ["Objective", brief.objective],
            ["CTA", brief.callToAction],
            ["Tone", brief.tone],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-xs text-neutral-500">{label}</span>
              <p className="text-sm text-neutral-200 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste your ${brief.assetType} copy here...`}
          rows={10}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-4 font-mono text-sm text-neutral-200 placeholder-neutral-600 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all leading-relaxed"
        />

        {/* Image upload area */}
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
            Attach Images <span className="normal-case text-neutral-600">(optional — ad creatives, screenshots, etc.)</span>
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-amber-500 bg-amber-500/10"
                : "border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50"
            }`}
          >
            <svg className="w-5 h-5 text-neutral-500 mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-xs text-neutral-500">
              Drop images here or <span className="text-amber-400">click to browse</span>
            </p>
            <p className="text-xs text-neutral-600 mt-0.5">JPEG, PNG, GIF, WebP · Max {MAX_SIZE_MB}MB each</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-24 h-24 object-cover rounded-lg border border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs text-neutral-600 mt-1 max-w-[96px] truncate text-center">{img.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submit row */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-3">
            {charLimit && charLimit.limit > 0 ? (
              <span
                className={`text-xs font-mono ${
                  text.length > charLimit.limit
                    ? "text-red-400"
                    : charLimit.recommended && text.length > charLimit.recommended
                    ? "text-amber-400"
                    : "text-neutral-500"
                }`}
              >
                {text.length} / {charLimit.limit}
                {text.length > charLimit.limit && " — OVER LIMIT"}
                {charLimit.recommended && text.length > charLimit.recommended && text.length <= charLimit.limit && " — over recommended"}
              </span>
            ) : (
              <span className="text-xs text-neutral-500">
                {text.length > 0 ? `${text.length} characters` : ""}
              </span>
            )}
            {images.length > 0 && (
              <span className="text-xs text-neutral-500">
                {images.length} image{images.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 disabled:text-neutral-500 text-neutral-900 font-semibold text-sm rounded-lg transition-colors"
          >
            Start Optimization →
          </button>
        </div>
      </form>
    </div>
  );
}
