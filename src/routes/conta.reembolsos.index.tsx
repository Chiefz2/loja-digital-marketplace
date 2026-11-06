import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { Pill } from "@/components/shop/ProductCard";
import { brl, dateBR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { reembolsoLabel } from "./conta.reembolsos.$id";

export const Route = createFileRoute("/conta/reembolsos/")({
  head: () => ({
    meta: [
      { title: "Solicitações de reembolso — mercado." },
      { name: "description", content: "Acompanhe suas solicitações de reembolso." },
      { property: "og:title", content: "Solicitações de reembolso — mercado." },
      { property: "og:description", content: "Área do cliente — reembolsos." },
    ],
  }),
  component: () => <AccountLayout><Lista /></AccountLayout>,
});

function Lista() {
  const { reembolsos } = useStore();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Solicitações de Reembolso</h1>
      {reembolsos.length === 0 && <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">Nenhuma solicitação aberta. Você pode pedir reembolso nos detalhes de um pedido entregue.</div>}
      {reembolsos.map((r) => (
        <Link key={r.id} to="/conta/reembolsos/$id" params={{ id: r.id }} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 hover:shadow-soft">
          <div className="flex-1">
            <div className="font-semibold">#{r.id} · Pedido #{r.pedidoId}</div>
            <div className="text-sm text-muted-foreground">{r.motivo} · aberto em {dateBR(r.data)}</div>
          </div>
          <Pill tone={r.status === "reembolsado" ? "success" : r.status === "recusado" ? "danger" : "warning"}>{reembolsoLabel[r.status]}</Pill>
          <span className="font-display font-bold">{brl(r.valor)}</span>
        </Link>
      ))}
    </div>
  );
}
