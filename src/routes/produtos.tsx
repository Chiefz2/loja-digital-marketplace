import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/shop/ProductCard";
import { allCategorias, catName, departamentos, getLoja, produtos, subcategorias } from "@/lib/data";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  ordem: z.enum(["vendidos", "menor", "lancamentos", "ofertas"]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  cond: z.enum(["novo", "usado"]).optional(),
  frete: z.boolean().optional(),
  nota4: z.boolean().optional(),
  page: z.number().optional(),
});

export const Route = createFileRoute("/produtos")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Produtos e ofertas — mercado." },
      { name: "description", content: "Busque e filtre produtos por categoria, preço, condição, frete grátis e avaliação." },
      { property: "og:title", content: "Produtos e ofertas — mercado." },
      { property: "og:description", content: "Catálogo completo com filtros avançados." },
    ],
  }),
  component: Listagem,
});

const PER_PAGE = 8;

function Listagem() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/produtos" });
  const [min, setMin] = useState(s.min?.toString() ?? "");
  const [max, setMax] = useState(s.max?.toString() ?? "");
  const [cond, setCond] = useState(s.cond);
  const [frete, setFrete] = useState(!!s.frete);
  const [nota4, setNota4] = useState(!!s.nota4);
  useEffect(() => {
    setMin(s.min?.toString() ?? ""); setMax(s.max?.toString() ?? ""); setCond(s.cond); setFrete(!!s.frete); setNota4(!!s.nota4);
  }, [s.min, s.max, s.cond, s.frete, s.nota4]);

  const cat = s.cat ? allCategorias.find((c) => c.id === s.cat) : undefined;
  const dep = cat?.pai ? departamentos.find((d) => d.id === cat.pai) : cat;

  const base = useMemo(
    () =>
      produtos.filter((p) => {
        if (s.cat && !p.categorias.includes(s.cat)) return false;
        if (s.q) {
          const q = s.q.toLowerCase();
          if (!p.titulo.toLowerCase().includes(q) && !getLoja(p.lojaId)?.nome.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [s.cat, s.q],
  );

  const filtered = useMemo(() => {
    let r = base.filter((p) => {
      if (s.min != null && p.preco < s.min) return false;
      if (s.max != null && p.preco > s.max) return false;
      if (s.cond && p.condicao !== s.cond) return false;
      if (s.frete && !p.freteGratis) return false;
      if (s.nota4 && p.nota < 4) return false;
      return true;
    });
    const o = s.ordem ?? "vendidos";
    r = [...r].sort((a, b) =>
      o === "menor" ? a.preco - b.preco
        : o === "lancamentos" ? b.dataCadastro.localeCompare(a.dataCadastro)
        : o === "ofertas" ? (b.precoOriginal ?? b.preco) / b.preco - (a.precoOriginal ?? a.preco) / a.preco
        : b.vendidos - a.vendidos,
    );
    return r;
  }, [base, s]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(s.page ?? 1, pages);
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const subs = subcategorias.filter((c) => c.pai === (dep?.id ?? ""));

  const apply = () =>
    navigate({
      search: (prev) => ({
        ...prev,
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
        cond,
        frete: frete || undefined,
        nota4: nota4 || undefined,
        page: undefined,
      }),
    });
  const clear = () => navigate({ search: { q: s.q, cat: s.cat } });

  const titulo = s.q ? `Resultados para "${s.q}"` : cat ? cat.nome : "Todos os produtos";

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex flex-wrap gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        {dep && <>/<Link to="/produtos" search={{ cat: dep.id }} className="hover:text-foreground">{dep.nome}</Link></>}
        {cat?.pai && <>/<span className="text-foreground">{cat.nome}</span></>}
      </nav>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {titulo} <span className="text-base font-normal text-muted-foreground">({filtered.length} produtos encontrados)</span>
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ordenar por:</span>
          <Select value={s.ordem ?? "vendidos"} onValueChange={(v) => navigate({ search: (p) => ({ ...p, ordem: v as typeof s.ordem, page: undefined }) })}>
            <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vendidos">Mais vendidos</SelectItem>
              <SelectItem value="menor">Menor preço</SelectItem>
              <SelectItem value="lancamentos">Lançamentos</SelectItem>
              <SelectItem value="ofertas">Ofertas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit space-y-6 rounded-2xl border bg-card p-5 text-sm">
          {subs.length > 0 && (
            <Group title="Subcategorias">
              {subs.map((c) => (
                <Link key={c.id} to="/produtos" search={{ cat: c.id }} className={`flex justify-between py-0.5 hover:text-brand ${s.cat === c.id ? "font-semibold text-brand" : ""}`}>
                  {c.nome} <span className="text-muted-foreground">({produtos.filter((p) => p.categorias.includes(c.id)).length})</span>
                </Link>
              ))}
            </Group>
          )}
          {!dep && (
            <Group title="Departamentos">
              {departamentos.map((c) => (
                <Link key={c.id} to="/produtos" search={{ cat: c.id }} className="flex justify-between py-0.5 hover:text-brand">
                  {c.nome} <span className="text-muted-foreground">({produtos.filter((p) => p.categorias.includes(c.id)).length})</span>
                </Link>
              ))}
            </Group>
          )}
          <Group title="Faixa de Preço">
            <div className="flex gap-2">
              <input type="number" placeholder="Mín" value={min} onChange={(e) => setMin(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-2" />
              <input type="number" placeholder="Máx" value={max} onChange={(e) => setMax(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-2" />
            </div>
          </Group>
          <Group title="Condição">
            {(["novo", "usado"] as const).map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 py-0.5">
                <Checkbox checked={cond === c} onCheckedChange={(v) => setCond(v ? c : undefined)} />
                <span className="capitalize">{c}</span> <span className="text-muted-foreground">({base.filter((p) => p.condicao === c).length})</span>
              </label>
            ))}
          </Group>
          <Group title="Benefícios">
            <label className="flex cursor-pointer items-center gap-2"><Checkbox checked={frete} onCheckedChange={(v) => setFrete(!!v)} /> Apenas Frete Grátis</label>
          </Group>
          <Group title="Avaliação">
            <label className="flex cursor-pointer items-center gap-2"><Checkbox checked={nota4} onCheckedChange={(v) => setNota4(!!v)} /> 4.0 ou mais</label>
          </Group>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={apply}>Aplicar Filtros</Button>
            <Button variant="outline" onClick={clear}>Limpar</Button>
          </div>
        </aside>

        <div>
          {shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground">Nenhum produto corresponde aos filtros aplicados.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-1.5">
              <PageBtn disabled={page === 1} onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })}><ChevronLeft className="size-4" /></PageBtn>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <PageBtn key={n} active={n === page} onClick={() => navigate({ search: (p) => ({ ...p, page: n }) })}>{n}</PageBtn>
              ))}
              <PageBtn disabled={page === pages} onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })}><ChevronRight className="size-4" /></PageBtn>
            </div>
          )}
          {s.cat && <p className="mt-6 text-xs text-muted-foreground">Categoria: {catName(s.cat)}</p>}
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function PageBtn({ children, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button {...props} className={`grid size-9 place-items-center rounded-lg border text-sm font-semibold disabled:opacity-40 ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}>
      {children}
    </button>
  );
}
