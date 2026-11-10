import { Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LogOut, MessageCircle, Package, RotateCcw, User } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";

const items = [
  { to: "/conta", label: "Dados do Perfil", icon: User, exact: true },
  { to: "/conta/cartoes", label: "Meus Cartões", icon: CreditCard },
  { to: "/conta/pedidos", label: "Histórico de Pedidos", icon: Package },
  { to: "/conta/reembolsos", label: "Solicitações de Reembolso", icon: RotateCcw },
  { to: "/conta/mensagens", label: "Mensagens", icon: MessageCircle },
] as const;

export function useRequireUser() {
  const { user, ready } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate({ to: "/entrar" });
  }, [ready, user, navigate]);
  return user;
}

export function AccountLayout({ children }: { children: ReactNode }) {
  const user = useRequireUser();
  const { logout } = useStore();
  const navigate = useNavigate();
  if (!user) return <div className="container-page py-20 text-center text-muted-foreground">Carregando…</div>;
  return (
    <div className="container-page grid gap-8 py-10 md:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border bg-card p-3">
        <div className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Minha Conta</div>
        <nav className="flex flex-col gap-0.5">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeOptions={{ exact: "exact" in i }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            >
              <i.icon className="size-4" /> {i.label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); navigate({ to: "/entrar" }); }}
            className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" /> Sair da Conta
          </button>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
