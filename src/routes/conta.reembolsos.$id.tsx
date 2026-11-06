import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { brl, dateTimeBR } from "@/lib/format";
import { useStore, type StatusReembolso } from "@/lib/store";

export const reembolsoLabel: Record<StatusReembolso, string> = {
  solicitado: "Solicitado",
  em_analise: "Em análise",
  aguardando_recebimento: "Aguardando recebimento",
  reembolsado: "Reembolsado",
  recusado: "Recusado",
};

export const Route = createFileRoute("/conta/reembolsos/$id")({
  head: () => ({
    meta: [
      { title: "Acompanhamento de reembolso — mercado." },
      { name: "description", content: "Etapas da devolução e estorno." },
      { property: "og:title", content: "Acompanhamento de reembolso — mercado." },
      { property: "og:description", content: "Área do cliente — reembolso." },
    ],
  }),
  component: () => <AccountLayout><Acompanhar /></AccountLayout>,
});

const order: StatusReembolso[] = ["solicitado", "em_analise", "aguardando_recebimento", "reembolsado"];

function Acompanhar() {
  const { id } = Route.useParams();
  const { reembolsos } = useStore();
  const r = reembolsos.find((x) => x.id === id);
  if (!r) return <p>Solicitação não encontrada.</p>;
  const cur = order.indexOf(r.status);
  const when = (s: StatusReembolso) => r.historico.find((h) => h.status === s)?.data;

  const etapas = [
    { t: "Reembolso Solicitado", d: when("solicitado") ? `Aberto em ${dateTimeBR(when("solicitado")!)}` : "" },
    { t: "Em Análise pelo Suporte", d: when("em_analise") ? `Analisado e aprovado para devolução física em ${dateTimeBR(when("em_analise")!)}` : "A loja está analisando sua solicitação" },
    { t: "Aguardando Recebimento do Produto", d: `Poste o pacote nos Correios com o código reverso: ${r.codigoReverso}` },
    { t: "Reembolso Concluído", d: `O valor de ${brl(r.valor)} será estornado em seu cartão ou PIX` },
  ];

  return (
    <div className="space-y-6">
      <Link to="/conta/reembolsos" className="text-sm text-muted-foreground hover:text-foreground">‹ Voltar às minhas solicitações</Link>
      <div>
        <h1 className="text-2xl font-bold">Acompanhamento de Reembolso #{r.id}</h1>
        <p className="text-muted-foreground">Pedido #{r.pedidoId} · Valor a estornar: <span className="font-semibold text-foreground">{brl(r.valor)}</span></p>
      </div>
      {r.status === "recusado" ? (
        <div className="rounded-2xl bg-destructive/10 p-5 text-destructive">Sua solicitação foi recusada. Fale com a loja para mais detalhes.</div>
      ) : (
        <ol className="rounded-2xl border bg-card p-6">
          {etapas.map((e, i) => {
            const done = i < cur || (i === cur && r.status === "reembolsado");
            const active = i === cur && r.status !== "reembolsado";
            return (
              <li key={e.t} className="relative flex gap-4 pb-8 last:pb-0">
                {i < etapas.length - 1 && <span className={`absolute left-4 top-9 h-[calc(100%-2.25rem)] w-0.5 ${i < cur ? "bg-success" : "bg-border"}`} />}
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-success text-primary-foreground" : active ? "bg-warning text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <div>
                  <div className={`font-semibold ${!done && !active ? "text-muted-foreground" : ""}`}>{e.t}</div>
                  <div className="text-sm text-muted-foreground">{e.d}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className="rounded-2xl border bg-card p-5 text-sm"><span className="font-semibold">Motivo:</span> {r.motivo}<p className="mt-1 text-muted-foreground">{r.descricao}</p></div>
      <Button variant="outline" onClick={() => toast("O chat com a loja chega na próxima etapa")}>Falar com Suporte da Loja</Button>
    </div>
  );
}
