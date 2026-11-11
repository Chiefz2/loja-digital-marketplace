import { createFileRoute, notFound } from "@tanstack/react-router";
import { BadgeCheck, Star } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { getLoja, produtos } from "@/lib/data";
import { usePainel } from "@/lib/painel";

export const Route = createFileRoute("/loja/$id")({
  loader: ({ params }) => {
    const l = getLoja(params.id);
    if (!l) throw notFound();
    return { nome: l.nome, descricao: l.descricao };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.nome} — Loja oficial | mercado.` },
          { name: "description", content: loaderData.descricao },
          { property: "og:title", content: `${loaderData.nome} — Loja oficial` },
          { property: "og:description", content: loaderData.descricao },
        ]
      : [{ title: "Loja não encontrada" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <div className="container-page py-20 text-center">Loja não encontrada.</div>,
  component: Vitrine,
});

const tabs = [
  ["vendidos", "Mais Vendidos"],
  ["lancamentos", "Lançamentos"],
  ["ofertas", "Ofertas"],
  ["menor", "Menor Preço"],
] as const;

function Vitrine() {
  const { id } = Route.useParams();
  const base = getLoja(id)!;
  const { empresa } = usePainel();
  const loja = empresa.id === id ? { ...base, nome: empresa.nomeFantasia, descricao: empresa.descricao } : base;
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("vendidos");
  const itens = produtos
    .filter((p) => p.lojaId === id)
    .sort((a, b) =>
      tab === "menor" ? a.preco - b.preco
        : tab === "lancamentos" ? b.dataCadastro.localeCompare(a.dataCadastro)
        : tab === "ofertas" ? (b.precoOriginal ?? b.preco) / b.preco - (a.precoOriginal ?? a.preco) / a.preco
        : b.vendidos - a.vendidos,
    );

  return (
    <div className="container-page py-8">
      <section className="relative overflow-hidden rounded-3xl bg-hero p-8 text-primary-foreground md:p-12">
        <div className="absolute -right-10 -top-16 size-64 rounded-full bg-brand/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <span className="grid size-24 shrink-0 place-items-center rounded-2xl bg-background font-display text-3xl font-bold text-foreground">{loja.iniciais}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{loja.nome}</h1>
              {loja.verificada && <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground"><BadgeCheck className="size-3" /> Loja Oficial</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1"><Star className="size-4 fill-brand text-brand" /> {loja.nota}</span>
              <span>{loja.avaliacoes} avaliações de loja</span>
              <span>+ Mais de {loja.vendas.toLocaleString("pt-BR")} vendas</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80">{loja.descricao}</p>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Todos os Produtos da Loja ({itens.length})</h2>
        <div className="flex gap-1 rounded-full border bg-card p-1">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
          ))}
        </div>
      </div>
      {itens.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed p-16 text-center text-muted-foreground">Loja sem produtos ativos no momento.</div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{itens.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
