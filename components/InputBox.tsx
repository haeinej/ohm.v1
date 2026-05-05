"use client";

import { ClipboardEvent } from "react";

interface InputBoxProps {
  onPaste: (text: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export function InputBox({ onPaste, value, onChange }: InputBoxProps) {
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (text.length > 200) {
      e.preventDefault();
      onPaste(text);
    }
  };

  return (
    <textarea
      className="w-full min-h-[200px] text-lg leading-relaxed resize-none outline-none placeholder:text-neutral-300 bg-transparent"
      placeholder="Paste texts that reflect you the most. AI memories, Notes, messages, documents."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={handlePaste}
    />
  );
}
