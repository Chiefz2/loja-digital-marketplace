import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { getProduto } from "@/lib/data";
import { brl, dateTimeBR } from "@/lib/format";
import { usePainel, type PedidoRecebido } from "@/lib/painel";
import { seo } from "@/lib/seo";
import { statusPedidoLabel, useStore, type StatusPedido } from "@/lib/store";

export const Route = createFileRoute("/painel/pedidos")({
  head: () => seo("Pedidos Recebidos", "Acompanhe vendas e atualize o status de envio."),
  component: () => <SideLayout perfil="empresa"><Pedidos /></SideLayout>,
});

const opcoes: StatusPedido[] = ["pago", "em_preparacao", "enviado", "entregue"];

function Pedidos() {
  const painel = usePainel();
  const store = useStore();
  const [filtro, setFiltro] = useState<"todos" | StatusPedido>("todos");
  const [draft, setDraft] = useState<Record<string, StatusPedido>>({});

  // Pedidos feitos na loja pelo cliente de demonstração também chegam aqui
  const doCliente: (PedidoRecebido & { origem: "cliente" })[] = store.pedidos
    .filter((p) => p.itens.some((i) => getProduto(i.produtoId)?.lojaId === painel.empresa.id))
    .map((p) => ({
      id: p.id, data: p.data, cliente: store.user?.nome ?? "Ana Souza", cidade: "São Paulo/SP", status: p.status, origem: "cliente",
      itens: p.itens.filter((i) => getProduto(i.produtoId)?.lojaId === painel.empresa.id).map((i) => `${getProduto(i.produtoId)?.titulo} × ${i.quantidade}`).join(", "),
      total: p.itens.filter((i) => getProduto(i.produtoId)?.lojaId === painel.empresa.id).reduce((a, i) => a + i.preco * i.quantidade, 0),
    }));
  const todos = [...doCliente, ...painel.pedidos.map((p) => ({ ...p, origem: "mock" as const }))].sort((a, b) => b.data.localeCompare(a.data));
  const lista = filtro === "todos" ? todos : todos.filter((p) => p.status === filtro);

  const salvar = (p: (typeof todos)[number]) => {
    const novo = draft[p.id];
    if (!novo || novo === p.status) return toast("Nenhuma alteração para salvar");
    if (p.origem === "cliente") store.setOrderStatus(p.id, novo);
    else painel.setStatusPedido(p.id, novo);
    toast.success(`Pedido #${p.id} atualizado para “${statusPedidoLabel[novo]}”. O cliente foi notificado.`);
  };

  return (
    <>
      <PageTitle
        title="Gerenciamento de Pedidos Recebidos"
        sub="Atualize o status dos pedidos para notificar automaticamente os clientes."
        action={
          <select value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)} className="h-10 rounded-lg border bg-card px-3 text-sm">
            <option value="todos">Todos</option>
            {(Object.keys(statusPedidoLabel) as StatusPedido[]).map((s) => <option key={s} value={s}>{statusPedidoLabel[s]}</option>)}
          </select>
        }
      />
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status atual</th><th className="pr-4 text-right">Ação</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Nenhum pedido encontrado.</td></tr>}
            {lista.map((p) => {
              const travado = p.status === "cancelado" || p.status === "aguardando_pagamento";
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3"><div className="font-semibold">#{p.id}</div><div className="text-xs text-muted-foreground">{dateTimeBR(p.data)}</div></td>
                  <td><div className="font-medium">{p.cliente}</div><div className="text-xs text-muted-foreground">{p.cidade}</div></td>
                  <td className="max-w-64 pr-3 text-xs">{p.itens}</td>
                  <td className="font-semibold">{brl(p.total)}</td>
                  <td>
                    {travado ? (
                      <span className="text-xs font-semibold text-muted-foreground">{statusPedidoLabel[p.status]}</span>
                    ) : (
                      <select value={draft[p.id] ?? p.status} onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value as StatusPedido })} className="h-9 rounded-lg border bg-card px-2 text-sm">
                        {opcoes.map((s) => <option key={s} value={s}>{statusPedidoLabel[s]}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="pr-4 text-right"><Button size="sm" disabled={travado} onClick={() => salvar(p)}>Salvar</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
