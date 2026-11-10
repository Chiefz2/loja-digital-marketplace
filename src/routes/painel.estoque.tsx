import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { catName } from "@/lib/data";
import { brl } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";
import { statusEstoque } from "@/lib/validators";

export const Route = createFileRoute("/painel/estoque")({
  head: () => seo("Gestão de Catálogo e Estoque", "Ajuste estoque e gerencie o catálogo da sua loja."),
  component: () => <SideLayout perfil="empresa"><Estoque /></SideLayout>,
});

function Estoque() {
  const { produtos, ajustarEstoque, inativarProduto, reativarProduto } = usePainel();
  const [q, setQ] = useState("");
  const lista = produtos.filter((p) => p.titulo.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Gestão de Catálogo e Estoque" action={<Button asChild><Link to="/painel/produto/novo"><Plus /> Novo Produto</Link></Button>} />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título do produto..." className="h-10 w-full rounded-full border bg-card pl-10 pr-4 text-sm outline-none focus:border-brand" />
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Produto</th><th>Status</th><th>Preço</th><th>Estoque atual</th><th className="pr-4 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum produto encontrado.</td></tr>}
            {lista.map((p) => {
              const st = p.status === "publicado" ? statusEstoque(p.estoque) : p.status;
              return (
                <tr key={p.id} className={`border-b last:border-0 ${p.status === "inativo" ? "opacity-60" : ""}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.fotos[0] ? <img src={p.fotos[0]} alt="" className="size-12 rounded-lg object-cover" /> : <div className="size-12 rounded-lg bg-secondary" />}
                      <div className="min-w-0">
                        <div className="font-semibold">{p.titulo}</div>
                        <div className="text-xs text-muted-foreground">{p.categorias.map(catName).join(" · ")}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Pill tone={st === "ativo" ? "success" : st === "esgotado" ? "danger" : st === "rascunho" ? "warning" : "muted"}>{st}</Pill>
                  </td>
                  <td className="font-semibold">{brl(p.preco)}</td>
                  <td>
                    <div className="inline-flex items-center rounded-lg border">
                      <button className="grid size-8 place-items-center hover:bg-accent disabled:opacity-40" disabled={p.estoque === 0} onClick={() => ajustarEstoque(p.id, -1)} aria-label="Diminuir"><Minus className="size-3.5" /></button>
                      <span className="w-10 text-center font-semibold">{p.estoque}</span>
                      <button className="grid size-8 place-items-center hover:bg-accent" onClick={() => ajustarEstoque(p.id, 1)} aria-label="Aumentar"><Plus className="size-3.5" /></button>
                    </div>
                  </td>
                  <td className="space-x-3 pr-4 text-right">
                    <Link to="/painel/produto/$id" params={{ id: p.id }} className="font-semibold text-brand">Editar</Link>
                    {p.status === "inativo" ? (
                      <button className="font-semibold" onClick={() => { reativarProduto(p.id); toast.success("Produto reativado"); }}>Reativar</button>
                    ) : (
                      <button className="font-semibold text-destructive" onClick={() => { inativarProduto(p.id); toast.success("Produto inativado. O histórico de compras foi preservado."); }}>Inativar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
