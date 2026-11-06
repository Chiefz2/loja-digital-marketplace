import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { motivosReembolso } from "@/lib/data";
import { useStore } from "@/lib/store";
import { canRequestRefund } from "@/lib/validators";

export const Route = createFileRoute("/conta/reembolsos/novo/$pedidoId")({
  head: () => ({
    meta: [
      { title: "Solicitar reembolso — mercado." },
      { name: "description", content: "Abra uma solicitação de devolução em até 30 dias após a entrega." },
      { property: "og:title", content: "Solicitar reembolso — mercado." },
      { property: "og:description", content: "Área do cliente — novo reembolso." },
    ],
  }),
  component: () => <AccountLayout><Novo /></AccountLayout>,
});

function Novo() {
  const { pedidoId } = Route.useParams();
  const { pedidos, requestRefund } = useStore();
  const navigate = useNavigate();
  const p = pedidos.find((x) => x.id === pedidoId);
  const [motivo, setMotivo] = useState<string>(motivosReembolso[0]!);
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState("");
  if (!p) return <p>Pedido não encontrado.</p>;
  const elegivel = p.status === "entregue" && canRequestRefund(p.entregueEm);

  return (
    <div className="space-y-6">
      <Link to="/conta/pedidos/$id" params={{ id: p.id }} className="text-sm text-muted-foreground hover:text-foreground">‹ Voltar</Link>
      <div>
        <h1 className="text-2xl font-bold">Solicitar Reembolso do Pedido #{p.id}</h1>
        <p className="text-muted-foreground">Prazo legal de devolução em até 30 dias corridos após a entrega</p>
      </div>
      {!elegivel ? (
        <div className="rounded-2xl bg-destructive/10 p-5 text-destructive">Este pedido não está dentro do prazo de reembolso.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form className="space-y-4 rounded-2xl border bg-card p-6" onSubmit={(e) => {
            e.preventDefault();
            if (desc.trim().length < 10) return setErr("Descreva o problema com pelo menos 10 caracteres");
            const id = requestRefund(p.id, motivo, desc, p.total);
            toast.success("Solicitação enviada");
            navigate({ to: "/conta/reembolsos/$id", params: { id } });
          }}>
            <h2 className="font-bold">Formulário de Abertura</h2>
            <div className="text-sm"><div className="mb-1.5 font-semibold">Motivo da solicitação</div>
              <Select value={motivo} onValueChange={setMotivo}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>{motivosReembolso.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="block text-sm font-semibold">Descrição detalhada do problema
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} className="mt-1.5 w-full rounded-lg border bg-card p-3 font-normal outline-none focus:border-brand" />
            </label>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" variant="brand" disabled={!desc.trim()}>Confirmar Solicitação de Reembolso</Button>
          </form>
          <aside className="h-fit space-y-4 rounded-2xl bg-secondary p-6 text-sm">
            <h2 className="font-bold">Orientações Oficiais de Logística Reversa</h2>
            <div><div className="font-semibold">1. Embalagem e Acessórios</div><p className="text-muted-foreground">Devolva na caixa original com manuais e cabos.</p></div>
            <div><div className="font-semibold">2. Código de Postagem dos Correios</div><p className="text-muted-foreground">Código reverso gratuito enviado por e-mail após aprovação.</p></div>
            <div><div className="font-semibold">3. Estorno dos Valores</div><p className="text-muted-foreground">Creditado na fatura do cartão ou PIX após recebimento.</p></div>
          </aside>
        </div>
      )}
    </div>
  );
}
