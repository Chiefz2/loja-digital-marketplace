import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Kpi, PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { brl } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () => seo("Visão Geral da Plataforma", "Métricas globais, ranking de lojas e saúde do sistema."),
  component: () => <SideLayout perfil="admin"><Admin /></SideLayout>,
});

const periodos = { Dia: 0.04, Mês: 1, Ano: 11.2, "Admin Geral": 26 } as const;

function Admin() {
  const { usuarios } = usePainel();
  const [p, setP] = useState<keyof typeof periodos>("Mês");
  const k = periodos[p];
  const vol = 284500 * k, ped = Math.round(186 * k);
  const ranking = [
    ["Tech Eletro Oficial", "11.222.333/0001-81", 92, 148200],
    ["Mundo Digital", "45.723.174/0001-10", 61, 96300],
    ["Casa Viva Store", "60.701.190/0001-04", 33, 40000],
  ] as const;
  const emp = usuarios.filter((u) => u.tipo === "empresa").length;
  return (
    <>
      <PageTitle title="Visão Geral da Plataforma" action={
        <div className="flex rounded-full border bg-card p-1">{(Object.keys(periodos) as (keyof typeof periodos)[]).map((x) => (
          <button key={x} onClick={() => setP(x)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${p === x ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{x}</button>
        ))}</div>
      } />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={`Volume total de vendas (${p})`} value={brl(vol)} hint="Apenas pedidos pagos confirmados" />
        <Kpi label="Pedidos processados" value={`${ped} Pedidos`} hint={`Ticket médio: ${brl(vol / Math.max(1, ped))}`} />
        <Kpi label="Base de usuários" value="1.420 Contas" hint={`1.340 Clientes · ${77 + emp} Empresas`} />
        <Kpi label="Margem global média" value="31,4%" tone="success" hint={`Lucro bruto est.: ${brl(vol * 0.314)}`} />
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <div className="p-5"><h2 className="font-bold">Ranking Oficial de Empresas por Vendas</h2><p className="text-xs text-muted-foreground">Ordenação decrescente por volume financeiro transacionado</p></div>
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-y bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Posição</th><th>Empresa/Loja</th><th>CNPJ</th><th>Pedidos pagos</th><th>Total vendido (pago)</th><th className="pr-4 text-right">Ação</th></tr></thead>
          <tbody>{ranking.map(([n, c, q, v], i) => (
            <tr key={n} className="border-b last:border-0">
              <td className="p-3"><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-brand text-brand-foreground" : "bg-secondary"}`}>{i + 1}º</span></td>
              <td className="font-semibold">{n}</td><td className="font-mono text-xs">{c}</td><td>{Math.round(q * k)}</td><td className="font-semibold">{brl(v * k)}</td>
              <td className="pr-4 text-right"><Link to="/admin/lojas" className="font-semibold text-brand">Inspecionar ›</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-8 font-bold">Saúde do Sistema & Integridade Transacional</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-success/30 bg-success-soft p-5 text-sm"><div className="font-bold text-success">✓ Consistência de Estoque</div><p className="mt-1">Nenhuma divergência entre baixas e pedidos confirmados</p></div>
        <div className="rounded-2xl border border-warning/30 bg-warning-soft p-5 text-sm"><div className="font-bold text-warning">! Monitoramento de Reembolsos</div><p className="mt-1">2 devoluções aguardando validação final de postagem</p></div>
        <div className="rounded-2xl border bg-card p-5 text-sm"><div className="font-bold">Modo Demonstração</div><p className="mt-1 text-muted-foreground">Métricas e relatórios abastecidos via dados de exemplo</p></div>
      </div>
    </>
  );
}
