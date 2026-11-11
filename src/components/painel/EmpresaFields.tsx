import { useState } from "react";
import { toast } from "sonner";
import { inputCls, textareaCls } from "@/components/painel/SideLayout";
import { maskCEP } from "@/lib/format";
import { fetchCEP } from "@/lib/helpers";

export function Campo({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm ${className ?? ""}`}><span className="mb-1.5 block font-semibold">{label}</span>{children}</label>;
}

export function LogoUpload({ value, onChange, label = "Alterar Logotipo" }: { value?: string | undefined; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="grid size-20 place-items-center overflow-hidden rounded-2xl border bg-secondary text-xs text-muted-foreground">{value ? <img src={value} alt="Logo" className="size-full object-cover" /> : "Logo"}</div>
      <div>
        <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-accent">
          {label}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            if (f.size > 5 * 1024 * 1024) return toast.error("O logotipo deve ter no máximo 5 MB.");
            const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f);
          }} />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WebP de até 5 MB</p>
      </div>
    </div>
  );
}

type End = { cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
export function EnderecoFields({ v, set, err }: { v: End; set: (p: Partial<End>) => void; err?: Record<string, string> }) {
  const [busy, setBusy] = useState(false);
  const f = (k: keyof End, label: string, cls = "") => (
    <Campo label={label} className={cls}>
      <input className={`${inputCls} ${err?.[k] ? "border-destructive" : ""}`} value={v[k]} onChange={(e) => set({ [k]: e.target.value })} />
      {err?.[k] && <span className="mt-1 block text-xs text-destructive">{err[k]}</span>}
    </Campo>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <Campo label={busy ? "CEP comercial (buscando…)" : "CEP comercial"} className="sm:col-span-2">
        <input className={`${inputCls} ${err?.cep ? "border-destructive" : ""}`} value={v.cep} onChange={async (e) => {
          const cep = maskCEP(e.target.value); set({ cep });
          if (cep.length === 9) { setBusy(true); try { set({ cep, ...(await fetchCEP(cep)) }); } catch { toast.error("CEP não encontrado"); } setBusy(false); }
        }} />
      </Campo>
      {f("logradouro", "Logradouro", "sm:col-span-4")}
      {f("numero", "Número", "sm:col-span-2")}
      {f("complemento", "Complemento", "sm:col-span-4")}
      {f("bairro", "Bairro", "sm:col-span-3")}
      {f("cidade", "Cidade", "sm:col-span-2")}
      {f("uf", "UF", "sm:col-span-1")}
    </div>
  );
}
export { textareaCls };
