import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { Pill } from "@/components/shop/ProductCard";
import { getLoja, getProduto } from "@/lib/data";
import { brl, dateBR } from "@/lib/format";
import { statusPedidoLabel, useStore, type StatusPedido } from "@/lib/store";
import { refundDeadline } from "@/lib/validators";

export const Route = createFileRoute("/conta/pedidos/")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — mercado." },
      { name: "description", content: "Histórico de pedidos realizados." },
      { property: "og:title", content: "Meus pedidos — mercado." },
      { property: "og:description", content: "Área do cliente — pedidos." },
    ],
  }),
  component: () => <AccountLayout><Pedidos /></AccountLayout>,
});

export const statusTone = (s: StatusPedido) =>
  s === "entregue" ? "success" : s === "cancelado" ? "danger" : s === "em_preparacao" || s === "aguardando_pagamento" ? "warning" : "dark";

function Pedidos() {
  const { pedidos } = useStore();
  const [f, setF] = useState<string>("todos");
  const lista = pedidos.filter((p) => f === "todos" || p.status === f);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Meus Pedidos Realizados</h1>
        <Select value={f} onValueChange={setF}>
          <SelectTrigger className="w-52 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(statusPedidoLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {lista.length === 0 && <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">Você ainda não realizou nenhum pedido</div>}
      {lista.map((p) => (
        <div key={p.id} className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-wrap gap-x-6 gap-y-1 bg-secondary px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Pedido realizado em {dateBR(p.data)}</span><span>Total: {brl(p.total)}</span><span>Pedido nº #{p.id}</span>
          </div>
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <div className="flex-1 space-y-2">
              <Pill tone={statusTone(p.status)}>{statusPedidoLabel[p.status]}</Pill>
              {p.itens.map((i) => {
                const pr = getProduto(i.produtoId);
                return <div key={i.produtoId} className="text-sm"><span className="font-semibold">{i.quantidade}× {pr?.titulo}</span> <span className="text-muted-foreground">— {getLoja(pr?.lojaId ?? "")?.nome}</span></div>;
              })}
              {p.entregueEm && <div className="text-xs text-muted-foreground">Entregue em {dateBR(p.entregueEm)} · Prazo de Reembolso até {dateBR(refundDeadline(p.entregueEm).toISOString())}</div>}
            </div>
            <Link to="/conta/pedidos/$id" params={{ id: p.id }} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground">Ver Detalhes →</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
