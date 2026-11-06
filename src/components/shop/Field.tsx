import { Lock } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function Field({ label, error, locked, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined; locked?: boolean | undefined }) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mb-1.5 flex items-center gap-1 font-semibold">
        {label} {locked && <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground"><Lock className="size-3" /> Não editável</span>}
      </span>
      <input
        {...props}
        disabled={locked || props.disabled}
        className={`h-11 w-full rounded-lg border bg-card px-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-secondary disabled:text-muted-foreground ${error ? "border-destructive" : ""}`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
