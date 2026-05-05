"use client";

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function SubmitButton({ loading, disabled, onClick }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="text-sm tracking-wide hover:underline disabled:opacity-30 disabled:no-underline"
    >
      {loading ? "..." : "Parse"}
    </button>
  );
}
