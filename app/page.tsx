"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputBox } from "@/components/InputBox";
import { DocumentBlock } from "@/components/DocumentBlock";
import { SubmitButton } from "@/components/SubmitButton";
import { usePipeline } from "@/lib/store";

interface DocBlock {
  id: string;
  preview: string;
  wordCount: number;
  fullText: string;
}

export default function InputPage() {
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [text, setText] = useState("");
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(false);
  const { setData } = usePipeline();
  const router = useRouter();

  const handlePaste = (pastedText: string) => {
    const block: DocBlock = {
      id: crypto.randomUUID(),
      preview: pastedText.slice(0, 60),
      wordCount: pastedText.split(/\s+/).filter(Boolean).length,
      fullText: pastedText,
    };
    setBlocks((prev) => [...prev, block]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSubmit = async () => {
    const rawText = [...blocks.map((b) => b.fullText), text].filter(Boolean).join("\n\n");
    if (!rawText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText, intent: intent || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Parse failed");
      }
      const data = await res.json();
      if (!data.timeline || !data.profile) {
        throw new Error("Incomplete response from server");
      }
      setData(data);
      router.push("/timeline");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasContent = blocks.length > 0 || text.trim().length > 0;

  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-6">
        {blocks.map((block) => (
          <DocumentBlock
            key={block.id}
            preview={block.preview}
            wordCount={block.wordCount}
            onRemove={() => removeBlock(block.id)}
          />
        ))}

        <InputBox value={text} onChange={setText} onPaste={handlePaste} />

        <input
          type="text"
          className="w-full text-sm outline-none bg-transparent placeholder:text-neutral-300"
          placeholder="Intent — e.g. Map my biography"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        />

        <div className="pt-4">
          <SubmitButton loading={loading} disabled={!hasContent} onClick={handleSubmit} />
        </div>
      </div>
    </main>
  );
}
