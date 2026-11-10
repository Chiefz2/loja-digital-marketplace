import { createFileRoute, Link } from "@tanstack/react-router";
import { Kpi, PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { brl } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";
import { margem } from "@/lib/validators";

export const Route = createFileRoute("/painel/")({
  head: () => seo("Visão Geral do Lojista", "Faturamento, lucro e margens da sua loja."),
  component: () => <SideLayout perfil="empresa"><Dashboard /></SideLayout>,
});

const meses = [["Mai", 38], ["Jun", 44], ["Jul", 52], ["Ago", 49], ["Set", 63], ["Out", 71], ["Nov", 82]] as const;

function Dashboard() {
  const { produtos, pedidos } = usePainel();
  const linhas = produtos.filter((p) => p.status !== "rascunho").map((p) => ({ ...p, ...margem(p.preco, p.custo) }));
  const total = linhas.reduce((a, p) => a + p.preco * p.vendidos, 0);
  const lucro = linhas.reduce((a, p) => a + p.lucro * p.vendidos, 0);
  const confirmados = pedidos.filter((p) => p.status !== "cancelado" && p.status !== "aguardando_pagamento").length + 1240;
  const prejuizo = linhas.filter((p) => p.prejuizo);
  const max = Math.max(...meses.map((m) => m[1]));

  return (
    <>
      <PageTitle title="Visão Geral" sub="Dados de demonstração para simulação gerencial." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total vendido" value={brl(total)} hint="▲ 12,4% vs. mês anterior" />
        <Kpi label="Pedidos confirmados" value={String(confirmados)} hint={`Ticket médio: ${brl(total / confirmados)}`} />
        <Kpi label="Lucro líquido estimado" value={brl(lucro)} tone="success" hint={`Margem média: ${((lucro / total) * 100).toFixed(1)}%`} />
        <Kpi
          label="Alerta de margem"
          value={`${prejuizo.length} ${prejuizo.length === 1 ? "Item" : "Itens"} com Prejuízo`}
          tone={prejuizo.length ? "danger" : "default"}
          hint="Preço menor que o custo (Margem < 0)"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-bold">Desempenho por Produto e Margens de Lucro</h2>
          <Link to="/painel/estoque" className="text-sm font-semibold text-brand">Ver estoque ›</Link>
        </div>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-y bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Produto</th><th>Vendidos</th><th>Preço venda</th><th>Custo unit.</th><th>Margem %</th><th className="pr-4 text-right">Lucro total</th></tr>
          </thead>
          <tbody>
            {linhas.map((p) => (
              <tr key={p.id} className={`border-b last:border-0 ${p.prejuizo ? "bg-destructive/5 text-destructive" : ""}`}>
                <td className="p-3 font-medium">{p.titulo}</td>
                <td>{p.vendidos}</td>
                <td>{brl(p.preco)}</td>
                <td>{brl(p.custo)}</td>
                <td className={`font-semibold ${p.prejuizo ? "" : "text-success"}`}>{p.pct > 0 ? "+" : ""}{p.pct.toFixed(1)}%</td>
                <td className={`pr-4 text-right font-semibold ${p.prejuizo ? "" : "text-success"}`}>{brl(p.lucro * p.vendidos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Crescimento de Vendas e Volume Mensal</h2>
          <Link to="/painel/pedidos" className="text-sm font-semibold text-brand">Ver pedidos ›</Link>
        </div>
        <div className="mt-6 flex h-48 items-end gap-3">
          {meses.map(([m, v]) => (
            <div key={m} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold">{v}k</span>
              <div className="w-full rounded-t-lg bg-brand/80" style={{ height: `${(v / max) * 140}px` }} />
              <span className="text-xs text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
