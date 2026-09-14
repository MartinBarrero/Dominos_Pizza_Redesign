import type React from "react";

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs font-bold" style={{ color: "#E31837" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      {msg}
    </p>
  );
}

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex items-center gap-1 text-sm font-bold text-neutral-900/80 mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
      {children}
      {required && <span style={{ color: "#E31837" }}>*</span>}
    </label>
  );
}

export function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    backgroundColor: "rgba(0,0,0,0.03)",
    border: `1.5px solid ${hasError ? "#E31837" : "rgba(0,0,0,0.12)"}`,
    color: "#1a1310",
    fontFamily: "var(--font-body)",
    boxShadow: hasError ? "0 0 0 3px rgba(227,24,55,0.15)" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
}

export function selectStyle(hasError: boolean): React.CSSProperties {
  return { ...inputStyle(hasError), backgroundImage: "none", appearance: "none" as const };
}
