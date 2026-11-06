import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, Laptop, Refrigerator, Shirt, Smartphone, Sofa, Sparkles, type LucideIcon } from "lucide-react";
import { departamentos, subcategorias } from "@/lib/data";

const icons: Record<string, LucideIcon> = { Refrigerator, Laptop, Smartphone, Sofa, Shirt, Sparkles, Dumbbell };

export const Route = createFileRoute("/departamentos")({
  head: () => ({
    meta: [
      { title: "Explorar por Departamentos — mercado." },
      { name: "description", content: "Navegue pelas categorias e encontre o produto ideal para o seu dia a dia." },
      { property: "og:title", content: "Explorar por Departamentos — mercado." },
      { property: "og:description", content: "Todas as categorias e subcategorias do marketplace." },
    ],
  }),
  component: Departamentos,
});

function Departamentos() {
  return (
    <div className="container-page py-8">
      <nav className="mb-4 text-sm text-muted-foreground"><Link to="/" className="hover:text-foreground">Home</Link> / Todas as Categorias</nav>
      <h1 className="text-3xl font-bold">Explorar por Departamentos</h1>
      <p className="mt-2 text-muted-foreground">Navegue pelas categorias e encontre o produto ideal para o seu dia a dia</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departamentos.map((d) => {
          const Icon = icons[d.icon] ?? Sparkles;
          const subs = subcategorias.filter((s) => s.pai === d.id);
          return (
            <div key={d.id} className="rounded-2xl border bg-card p-6 transition hover:shadow-lift">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="size-6" /></span>
                <Link to="/produtos" search={{ cat: d.id }} className="font-display text-lg font-bold hover:text-brand">{d.nome}</Link>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {subs.map((s) => (
                  <li key={s.id}><Link to="/produtos" search={{ cat: s.id }} className="hover:text-foreground">{s.nome}</Link></li>
                ))}
              </ul>
              <Link to="/produtos" search={{ cat: d.id }} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
                Ver todos ({subs.length} subcategorias) →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
