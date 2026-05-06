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
      className="group relative w-8 h-8 flex items-center justify-center disabled:opacity-20 transition-transform duration-150 active:scale-95"
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {loading ? (
        <span className="block w-5 h-5 rounded-full border border-black animate-pulse-ring" />
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="transition-transform duration-150 group-hover:translate-y-[-1px]"
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          <path
            d="M9 15V3M9 3L3.5 8.5M9 3L14.5 8.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
