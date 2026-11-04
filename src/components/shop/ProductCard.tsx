import { Link } from "@tanstack/react-router";
import { getLoja, parcelas, type Produto } from "@/lib/data";
import { brl } from "@/lib/format";
import { Stars } from "./Stars";

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "success" | "brand" | "dark" | "warning" | "danger" }) {
  const tones = {
    muted: "bg-secondary text-secondary-foreground",
    success: "bg-success-soft text-success",
    brand: "bg-brand-soft text-brand",
    dark: "bg-primary text-primary-foreground",
    warning: "bg-warning-soft text-warning",
    danger: "bg-destructive/10 text-destructive",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
}

export function ProductCard({ p }: { p: Produto }) {
  const loja = getLoja(p.lojaId);
  const n = parcelas(p.preco);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link to="/produto/$id" params={{ id: p.id }} className="relative block aspect-square overflow-hidden bg-surface">
        <img src={p.fotos[0]} alt={p.titulo} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {p.freteGratis && <Pill tone="success">Frete grátis</Pill>}
          <Pill tone={p.condicao === "novo" ? "dark" : "warning"}>{p.condicao}</Pill>
          {p.estoque === 0 && <Pill tone="danger">Esgotado</Pill>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {loja && (
          <Link to="/loja/$id" params={{ id: loja.id }} className="text-xs text-muted-foreground hover:text-brand">
            Vendido por: <span className="font-semibold">{loja.nome}</span>
          </Link>
        )}
        <Link to="/produto/$id" params={{ id: p.id }} className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug hover:text-brand">
          {p.titulo}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stars value={p.nota} size={12} /> {p.nota.toFixed(1)} ({p.totalAvaliacoes})
        </div>
        <div className="mt-auto pt-2">
          {p.precoOriginal && <div className="text-xs text-muted-foreground line-through">{brl(p.precoOriginal)}</div>}
          <div className="font-display text-xl font-bold">{brl(p.preco)}</div>
          <div className="text-xs text-success">em até {n}x de {brl(p.preco / n)} sem juros</div>
        </div>
        <Link
          to="/produto/$id"
          params={{ id: p.id }}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border text-sm font-semibold transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
