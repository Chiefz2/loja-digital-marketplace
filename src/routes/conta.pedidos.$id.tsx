import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Download, MessageCircle, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { Pill } from "@/components/shop/ProductCard";
import { getLoja, getProduto } from "@/lib/data";
import { brl, dateBR, dateTimeBR } from "@/lib/format";
import { statusPedidoLabel, useStore } from "@/lib/store";
import { canCancelOrder, canRequestRefund, refundDeadline } from "@/lib/validators";
import { statusTone } from "./conta.pedidos.index";

export const Route = createFileRoute("/conta/pedidos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do pedido — mercado." },
      { name: "description", content: "Rastreamento, nota fiscal e ações do pedido." },
      { property: "og:title", content: "Detalhes do pedido — mercado." },
      { property: "og:description", content: "Área do cliente — pedido." },
    ],
  }),
  component: () => <AccountLayout><Detalhe /></AccountLayout>,
});

const steps = ["pago", "em_preparacao", "enviado", "entregue"] as const;

function Detalhe() {
  const { id } = Route.useParams();
  const { pedidos, cancelOrder, user, addReview, reembolsos } = useStore();
  const p = pedidos.find((x) => x.id === id);
  const [avaliar, setAvaliar] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  if (!p) return <p>Pedido não encontrado.</p>;
  const idx = p.status === "aguardando_pagamento" ? -1 : steps.indexOf(p.status as (typeof steps)[number]);
  const reembolso = reembolsos.find((r) => r.pedidoId === p.id);

  return (
    <div className="space-y-6">
      <Link to="/conta/pedidos" className="text-sm text-muted-foreground hover:text-foreground">‹ Voltar aos meus pedidos</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Detalhes do Pedido #{p.id}</h1>
        <Pill tone={statusTone(p.status)}>{statusPedidoLabel[p.status]}</Pill>
      </div>

      {p.status !== "cancelado" && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-5 font-bold">Rastreamento do Pedido</h2>
          <div className="grid grid-cols-4">
            {steps.map((s, i) => {
              const done = i < idx || (i === idx && s === "entregue");
              const active = i === idx && s !== "entregue";
              return (
                <div key={s} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full ${i <= idx ? "bg-success" : "bg-border"}`} />}
                  <span className={`relative grid size-8 place-items-center rounded-full text-xs font-bold ${done ? "bg-success text-primary-foreground" : active ? "bg-warning text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className="mt-2 text-xs font-semibold">{statusPedidoLabel[s]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 font-bold">Itens Comprados</h2>
            {p.itens.map((i) => {
              const pr = getProduto(i.produtoId);
              return (
                <div key={i.produtoId} className="flex items-center gap-3 border-b py-3 last:border-0">
                  <img src={pr?.fotos[0]} alt="" className="size-14 rounded-lg bg-surface object-cover" />
                  <div className="flex-1 text-sm">
                    <div className="font-semibold">{pr?.titulo}</div>
                    <div className="text-muted-foreground">{i.quantidade}× {brl(i.preco)} · {getLoja(pr?.lojaId ?? "")?.nome}</div>
                  </div>
                  {p.status === "entregue" && (i.avaliado ? <Pill tone="success">Avaliado</Pill> : <Button size="sm" variant="outline" onClick={() => setAvaliar(i.produtoId)}><Star /> Avaliar Produto</Button>)}
                </div>
              );
            })}
            <div className="mt-3 flex justify-between text-sm"><span>Frete</span><span>{p.frete ? brl(p.frete) : "Grátis"}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{brl(p.total)}</span></div>
          </div>
          <div className="rounded-2xl border bg-card p-5 text-sm">
            <h2 className="mb-2 font-bold">Endereço de Entrega</h2>
            <p>{user?.nome}</p><p className="text-muted-foreground">{p.endereco}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="text-destructive" disabled={!canCancelOrder(p.status)} onClick={() => setConfirm(true)}>Cancelar Pedido</Button>
            {p.status === "entregue" && (reembolso ? (
              <Button asChild variant="outline"><Link to="/conta/reembolsos/$id" params={{ id: reembolso.id }}>Acompanhar reembolso</Link></Button>
            ) : canRequestRefund(p.entregueEm) ? (
              <Button asChild variant="outline"><Link to="/conta/reembolsos/novo/$pedidoId" params={{ pedidoId: p.id }}>Solicitar Reembolso</Link></Button>
            ) : <span className="self-center text-xs text-muted-foreground">Prazo de reembolso encerrado</span>)}
          </div>
          {p.entregueEm && <p className="text-xs text-muted-foreground">Prazo de reembolso até {dateBR(refundDeadline(p.entregueEm).toISOString())}</p>}
        </div>

        <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5 text-sm">
          <h2 className="font-bold">Nota Fiscal Eletrônica</h2>
          <div><div className="text-xs text-muted-foreground">Chave de Acesso</div><div className="break-all font-mono text-xs">{p.nfe.chave.replace(/(\d{4})/g, "$1 ")}</div></div>
          <div className="grid grid-cols-2 gap-2">
            <div><div className="text-xs text-muted-foreground">Número</div>{p.nfe.numero}</div>
            <div><div className="text-xs text-muted-foreground">Série</div>{p.nfe.serie}</div>
          </div>
          <div><div className="text-xs text-muted-foreground">Emissão</div>{dateTimeBR(p.nfe.emissao)}</div>
          <Button className="w-full" onClick={() => toast("Download da nota fiscal iniciado (demonstração)")}><Download /> Baixar PDF da Nota Fiscal</Button>
          <button onClick={() => toast("O chat com a loja chega na próxima etapa")} className="flex items-center gap-1.5 text-sm font-semibold text-brand"><MessageCircle className="size-4" /> Abrir Chamado / Chat com a Loja</button>
        </aside>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Cancelar pedido #{p.id}?</AlertDialogTitle><AlertDialogDescription>O estoque será liberado e o valor estornado.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => { cancelOrder(p.id); toast.success("Pedido cancelado"); }}>Cancelar pedido</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {avaliar && <ReviewModal produtoId={avaliar} onClose={() => setAvaliar(null)} onSubmit={(nota, comentario, fotos) => {
        addReview(p.id, { produtoId: avaliar, autor: user?.nome.split(" ")[0] + " " + (user?.nome.split(" ")[1]?.[0] ?? "") + ".", nota, comentario, fotos });
        toast.success("Avaliação publicada!");
        setAvaliar(null);
      }} />}
    </div>
  );
}

function ReviewModal({ produtoId, onClose, onSubmit }: { produtoId: string; onClose: () => void; onSubmit: (n: number, c: string, f: string[]) => void }) {
  const pr = getProduto(produtoId)!;
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [txt, setTxt] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [err, setErr] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Avaliar Produto Recebido</DialogTitle><DialogDescription>Sua avaliação ajuda outros clientes a comprar melhor</DialogDescription></DialogHeader>
        <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
          <img src={pr.fotos[0]} alt="" className="size-12 rounded-lg object-cover" />
          <div className="text-sm"><div className="font-semibold">{pr.titulo}</div><div className="text-muted-foreground">{getLoja(pr.lojaId)?.nome}</div></div>
        </div>
        <div>
          <div className="mb-1 text-sm font-semibold">Nota Geral</div>
          <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onMouseEnter={() => setHover(i)} onClick={() => setNota(i)} aria-label={`${i} estrelas`}>
                <Star className={`size-8 ${(hover || nota) >= i ? "fill-brand text-brand" : "text-border"}`} />
              </button>
            ))}
          </div>
        </div>
        <label className="text-sm font-semibold">Seu Comentário
          <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border bg-card p-3 font-normal outline-none focus:border-brand" />
        </label>
        <div>
          <div className="mb-1 text-sm font-semibold">Fotos do Produto (Máx 3 imagens de 2MB)</div>
          <div className="flex gap-2">
            {fotos.map((f, i) => <img key={i} src={f} alt="" className="size-16 rounded-lg object-cover" />)}
            {fotos.length < 3 && (
              <label className="grid size-16 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:border-brand">
                <Plus className="size-5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) return setErr("Imagem acima de 2MB");
                  setFotos((f) => [...f, URL.createObjectURL(file)]);
                }} />
              </label>
            )}
          </div>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => (nota ? onSubmit(nota, txt, fotos) : setErr("Selecione uma nota de 1 a 5 estrelas"))}>Publicar Avaliação</Button>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
