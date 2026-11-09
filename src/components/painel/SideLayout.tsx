import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell, Boxes, FolderTree, LayoutDashboard, LogOut, MessageCircle, PackagePlus, ShieldAlert, ShoppingCart, Store, Users, type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { usePainel, type Perfil } from "@/lib/painel";

type Item = { to: string; label: string; icon: LucideIcon; exact?: boolean };
const menus: Record<Perfil, { titulo: string; items: Item[] }> = {
  empresa: {
    titulo: "Painel Lojista",
    items: [
      { to: "/painel", label: "Visão Geral", icon: LayoutDashboard, exact: true },
      { to: "/painel/estoque", label: "Gestão de Estoque", icon: Boxes },
      { to: "/painel/produto/novo", label: "Cadastrar Produto", icon: PackagePlus },
      { to: "/painel/pedidos", label: "Pedidos Recebidos", icon: ShoppingCart },
      { to: "/painel/notificacoes", label: "Notificações", icon: Bell },
      { to: "/painel/mensagens", label: "Mensagens", icon: MessageCircle },
      { to: "/painel/perfil", label: "Perfil da Empresa", icon: Store },
    ],
  },
  admin: {
    titulo: "Marketplace Admin",
    items: [
      { to: "/admin", label: "Métricas Gerais", icon: LayoutDashboard, exact: true },
      { to: "/admin/usuarios", label: "Gestão de Usuários", icon: Users },
      { to: "/admin/lojas", label: "Lojas & Catálogos", icon: Store },
      { to: "/admin/categorias", label: "Categorias Globais", icon: FolderTree },
      { to: "/admin/moderacao", label: "Moderação & Denúncias", icon: ShieldAlert },
    ],
  },
};

export function useRequirePerfil(p: Perfil) {
  const { sessao, ready } = usePainel();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && sessao !== p) navigate({ to: "/entrar" });
  }, [ready, sessao, p, navigate]);
  return ready && sessao === p;
}

export function SideLayout({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  const ok = useRequirePerfil(perfil);
  const { sair, notificacoes, conversas } = usePainel();
  const navigate = useNavigate();
  if (!ok) return <div className="container-page py-20 text-center text-muted-foreground">Carregando…</div>;
  const m = menus[perfil];
  const badge = (to: string) =>
    perfil === "empresa" && to === "/painel/mensagens"
      ? conversas.reduce((a, c) => a + c.naoLidasLoja, 0)
      : perfil === "empresa" && to === "/painel/notificacoes"
        ? notificacoes.filter((n) => n.tipo !== "pedido").length
        : 0;
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border bg-card p-3 lg:sticky lg:top-24">
        <div className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{m.titulo}</div>
        <nav className="flex flex-col gap-0.5">
          {m.items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeOptions={{ exact: !!i.exact }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            >
              <i.icon className="size-4" /> <span className="flex-1">{i.label}</span>
              {badge(i.to) > 0 && <span className="grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{badge(i.to)}</span>}
            </Link>
          ))}
          <button
            onClick={() => { sair(); navigate({ to: "/entrar" }); }}
            className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kpi({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "success" | "danger" }) {
  const c = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "";
  return (
    <div className={`rounded-2xl border bg-card p-5 ${tone === "danger" ? "border-destructive/40 bg-destructive/5" : ""}`}>
      <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-2xl font-bold ${c}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export const inputCls = "h-11 w-full rounded-lg border bg-card px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
export const textareaCls = "min-h-28 w-full rounded-lg border bg-card p-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
