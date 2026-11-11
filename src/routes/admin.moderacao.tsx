import { createFileRoute } from "@tanstack/react-router";
import { Ban, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { Stars } from "@/components/shop/Stars";
import { getProduto } from "@/lib/data";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/moderacao")({
  validateSearch: (s: Record<string, unknown>): { produto?: string } => (typeof s.produto === "string" ? { produto: s.produto } : {}),
  head: () => seo("Moderação e Denúncias", "Modere avaliações e resolva denúncias."),
  component: () => <SideLayout perfil="admin"><Moderacao /></SideLayout>,
});

function Moderacao() {
  const { produto } = Route.useSearch();
  const { denuncias, avaliacoesRep, resolverDenuncia, moderarAvaliacao, inativarPeloAdmin, produtos, inativadosAdmin } = usePainel();
  const alvo = produto ? produtos.find((p) => p.id === produto) ?? getProduto(produto) : undefined;
  const alvoInativo = produto ? inativadosAdmin.includes(produto) || produtos.find((p) => p.id === produto)?.status === "inativo" : false;
  return (
    <>
      <PageTitle title="Central de Moderação e Fila de Denúncias" sub="Modere avaliações reportadas e resolva denúncias de produtos, empresas e usuários" />
      {alvo && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-brand/40 bg-card p-5">
          <div className="flex-1"><Pill tone="brand">Moderação direta</Pill><div className="mt-1 font-bold">{alvo.titulo}</div></div>
          <Button variant="destructive" disabled={alvoInativo} onClick={() => { inativarPeloAdmin(produto!); toast.success("Produto inativado"); }}><Ban /> {alvoInativo ? "Produto inativo" : "Inativar Produto"}</Button>
        </div>
      )}
      <h2 className="mb-3 font-bold">Fila de Denúncias Pendentes</h2>
      <div className="space-y-3">
        {denuncias.map((d) => (
          <article key={d.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2"><Pill tone="danger">Alvo: {d.alvo}</Pill><Pill tone={d.status === "aberta" ? "warning" : "success"}>{d.status === "aberta" ? "Aberta" : d.status === "resolvida" ? "Resolvida" : "Produto inativado"}</Pill></div>
            <h3 className="mt-2 font-bold">Denúncia #{d.id} — Produto: “{d.produto}”</h3>
            <p className="text-sm">Motivo: {d.motivo}</p>
            <p className="mt-1 text-xs text-muted-foreground">Denunciado por: {d.denunciante} · Alvo: {d.loja}</p>
            {d.status === "aberta" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="destructive" size="sm" onClick={() => { const p = produtos.find((x) => x.titulo === d.produto); if (p) inativarPeloAdmin(p.id); resolverDenuncia(d.id, "produto_inativado"); toast.success("Produto inativado"); }}><Ban /> Inativar Produto</Button>
                <Button size="sm" onClick={() => { resolverDenuncia(d.id, "resolvida"); toast.success("Denúncia resolvida"); }}><Check /> Marcar Resolvida</Button>
              </div>
            )}
          </article>
        ))}
      </div>
      <h2 className="mb-3 mt-8 font-bold">Moderação de Avaliações de Clientes</h2>
      <div className="space-y-3">
        {avaliacoesRep.map((a) => (
          <article key={a.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2"><Pill tone="warning">Avaliação produto</Pill><span className="text-xs text-muted-foreground">Reportada: {a.motivo}</span></div>
            <h3 className="mt-2 font-bold">Avaliação no Produto “{a.produto}”</h3>
            <div className="mt-1 flex items-center gap-2 text-sm"><Stars value={a.nota} /> por {a.autor}</div>
            <p className="mt-2 rounded-lg bg-secondary p-3 text-sm italic">“{a.comentario}”</p>
            {a.status === "pendente" ? (
              <div className="mt-3 flex gap-2">
                <Button variant="destructive" size="sm" onClick={() => { moderarAvaliacao(a.id, "removida"); toast.success("Avaliação removida"); }}><Trash2 /> Remover Avaliação</Button>
                <Button variant="outline" size="sm" onClick={() => { moderarAvaliacao(a.id, "mantida"); toast.success("Avaliação mantida"); }}>Manter Avaliação</Button>
              </div>
            ) : <p className="mt-3 text-sm font-semibold text-muted-foreground">{a.status === "removida" ? "Avaliação removida" : "Avaliação mantida"}</p>}
          </article>
        ))}
      </div>
    </>
  );
}
