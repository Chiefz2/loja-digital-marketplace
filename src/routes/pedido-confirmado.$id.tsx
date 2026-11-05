import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getProduto } from "@/lib/data";
import { brl, dateBR } from "@/lib/format";
import { statusPedidoLabel, useStore } from "@/lib/store";

export const Route = createFileRoute("/pedido-confirmado/$id")({
  head: () => ({
    meta: [
      { title: "Pedido confirmado — mercado." },
      { name: "description", content: "Seu pedido foi recebido com sucesso." },
      { property: "og:title", content: "Pedido confirmado — mercado." },
      { property: "og:description", content: "Comprovante do pedido." },
    ],
  }),
  component: Confirmado,
});

function Confirmado() {
  const { id } = Route.useParams();
  const { pedidos, ready } = useStore();
  const p = pedidos.find((x) => x.id === id);
  if (!ready) return null;
  if (!p) return <div className="container-page py-24 text-center">Pedido não encontrado.</div>;
  const previsao = new Date(new Date(p.data).getTime() + 7 * 86400000).toISOString();
  const pix = `00020126580014BR.GOV.BCB.PIX0136mercado-${p.id}5204000053039865406${p.total.toFixed(2)}`;

  return (
    <div className="container-page max-w-2xl py-12">
      <div className="rounded-3xl border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h1 className="mt-4 text-3xl font-bold">Pedido recebido!</h1>
        <p className="mt-1 text-muted-foreground">Pedido <span className="font-semibold text-foreground">#{p.id}</span> · {statusPedidoLabel[p.status]}</p>
        <p className="mt-1 text-sm text-success">Estoque reservado e nota fiscal emitida.</p>
      </div>

      {p.pagamento === "pix" && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border bg-card p-6">
          <QrCode className="size-32" />
          <div className="w-full break-all rounded-lg bg-secondary p-3 text-xs">{pix}</div>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(pix); toast.success("Código copiado"); }}><Copy /> Copiar código PIX</Button>
        </div>
      )}

      <div className="mt-4 space-y-3 rounded-3xl border bg-card p-6 text-sm">
        {p.itens.map((i) => (
          <div key={i.produtoId} className="flex justify-between gap-3"><span>{i.quantidade}× {getProduto(i.produtoId)?.titulo}</span><span>{brl(i.preco * i.quantidade)}</span></div>
        ))}
        <div className="flex justify-between border-t pt-3 font-semibold"><span>Total pago</span><span>{brl(p.total)}</span></div>
        <div className="text-muted-foreground">Entrega em: {p.endereco}</div>
        <div className="text-muted-foreground">Previsão de entrega: até {dateBR(previsao)}</div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button asChild><Link to="/conta/pedidos">Ver meus pedidos</Link></Button>
        <Button asChild variant="outline"><Link to="/">Continuar comprando</Link></Button>
      </div>
    </div>
  );
}
