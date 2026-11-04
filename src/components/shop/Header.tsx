import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { departamentos } from "@/lib/data";
import { useStore } from "@/lib/store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, cart, logout } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const count = cart.reduce((a, i) => a + i.quantidade, 0);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">m</span>
          <span className="hidden sm:inline">mercado<span className="text-brand">.</span></span>
        </Link>
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/produtos", search: { q: q || undefined } });
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produtos, marcas e lojas"
            className="h-10 w-full rounded-full border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </form>
        <Link to="/carrinho" className="relative grid size-10 place-items-center rounded-full hover:bg-accent" aria-label="Carrinho">
          <ShoppingBag className="size-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">{count}</span>
          )}
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold hover:bg-accent">
              <User className="size-4" /> <span className="hidden md:inline">{user.nome.split(" ")[0]}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/conta" })}>Minha conta</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/conta/pedidos" })}>Meus pedidos</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/entrar" }); }}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/entrar" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Entrar
          </Link>
        )}
      </div>
      <nav className="container-page hidden h-10 items-center gap-6 text-sm text-muted-foreground md:flex">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 font-semibold text-foreground">
            Categorias <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {departamentos.map((d) => (
              <DropdownMenuItem key={d.id} onClick={() => navigate({ to: "/produtos", search: { cat: d.id } })}>{d.nome}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/departamentos" })}>Ver todos os departamentos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/produtos" search={{ ordem: "ofertas" }} className="hover:text-foreground">Ofertas</Link>
        <Link to="/departamentos" className="hover:text-foreground">Departamentos</Link>
        <Link to="/loja/$id" params={{ id: "tech-eletro" }} className="hover:text-foreground">Lojas oficiais</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container-page flex flex-col gap-2 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <span className="font-display font-bold text-foreground">mercado<span className="text-brand">.</span></span>
        <span>Marketplace — compra garantida, nota fiscal em todos os pedidos.</span>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
