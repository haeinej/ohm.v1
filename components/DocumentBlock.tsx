"use client";

interface DocumentBlockProps {
  preview: string;
  wordCount: number;
  onRemove: () => void;
}

export function DocumentBlock({ preview, wordCount, onRemove }: DocumentBlockProps) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 border border-neutral-200 my-2">
      <span className="text-sm truncate flex-1">{preview}</span>
      <span className="text-xs text-neutral-400">{wordCount} words</span>
      <button onClick={onRemove} className="text-xs hover:underline">
        x
      </button>
    </div>
  );
}
