import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { lojas, produtos as catalogo } from "@/lib/data";
import { brl } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/lojas")({
  head: () => seo("Empresas e Catálogos", "Inspecione o inventário de cada empresa cadastrada."),
  component: () => <SideLayout perfil="admin"><Lojas /></SideLayout>,
});

function Lojas() {
  const { usuarios, produtos, empresa, inativadosAdmin } = usePainel();
  const [aberta, setAberta] = useState<string>("tech-eletro");
  const [carregando, setCarregando] = useState(false);
  const abrir = (id: string) => { if (aberta === id) return setAberta(""); setCarregando(true); setAberta(id); setTimeout(() => setCarregando(false), 400); };
  return (
    <>
      <PageTitle title="Visualização Geral de Empresas e Catálogos" sub="Inspecione o inventário e a oferta de produtos de cada empresa cadastrada" />
      <div className="space-y-4">
        {lojas.map((l) => {
          const doc = usuarios.find((u) => u.lojaId === l.id)?.documento ?? "—";
          const nome = l.id === empresa.id ? empresa.nomeFantasia : l.nome;
          const itens = l.id === empresa.id
            ? produtos.map((p) => ({ id: p.id, titulo: p.titulo, preco: p.preco, custo: p.custo, estoque: p.estoque, ativo: p.status === "publicado" }))
            : catalogo.filter((p) => p.lojaId === l.id).map((p) => ({ id: p.id, titulo: p.titulo, preco: p.preco, custo: Math.round(p.preco * 0.7), estoque: p.estoque, ativo: !inativadosAdmin.includes(p.id) }));
          const open = aberta === l.id;
          return (
            <div key={l.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex flex-wrap items-center gap-4 p-5">
                <span className="grid size-12 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">{l.iniciais}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{nome}</div>
                  <div className="text-xs text-muted-foreground">CNPJ {doc} · {itens.filter((i) => i.ativo).length} produtos ativos · <Star className="inline size-3 fill-current text-brand" /> {l.nota}</div>
                </div>
                <Button variant="outline" size="sm" asChild><Link to="/loja/$id" params={{ id: l.id }}>Ver Vitrine</Link></Button>
                <Button size="sm" onClick={() => abrir(l.id)}>{open ? "Recolher" : "Abrir Catálogo"} <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} /></Button>
              </div>
              {open && (carregando ? <p className="border-t p-6 text-center text-sm text-muted-foreground">Carregando catálogo…</p> : (
                <div className="overflow-x-auto border-t">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Produto no catálogo</th><th>Preço</th><th>Custo</th><th>Estoque</th><th>Status</th><th className="pr-4 text-right">Ação admin</th></tr></thead>
                    <tbody>{itens.map((p) => (
                      <tr key={p.id} className={`border-t ${p.custo > p.preco ? "bg-destructive/5" : ""}`}>
                        <td className="p-3 font-medium">{p.titulo}</td><td>{brl(p.preco)}</td><td className={p.custo > p.preco ? "font-semibold text-destructive" : ""}>{brl(p.custo)}</td><td>{p.estoque}</td>
                        <td><Pill tone={p.ativo ? "success" : "muted"}>{p.ativo ? "ativo" : "inativo"}</Pill></td>
                        <td className="pr-4 text-right"><Link to="/admin/moderacao" search={{ produto: p.id }} className="font-semibold text-destructive">Moderar</Link></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
