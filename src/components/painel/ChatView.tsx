import { Link } from "@tanstack/react-router";
import { Paperclip, Search, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { getProduto } from "@/lib/data";
import { dateTimeBR } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { statusPedidoLabel, useStore } from "@/lib/store";
import { chatAnexoErro } from "@/lib/validators";

/** T25 — chat compartilhado entre cliente e loja */
export function ChatView({ lado, pedidoInicial }: { lado: "cliente" | "loja"; pedidoInicial?: string | undefined }) {
  const { conversas, enviarMensagem, marcarLida, pedidos: pedidosLoja } = usePainel();
  const { pedidos: pedidosCliente, user } = useStore();
  const lista = useMemo(
    () => (lado === "cliente" ? conversas.filter((c) => c.cliente === (user?.nome ?? "Ana Souza")) : conversas),
    [conversas, lado, user],
  );
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | undefined>(() => (pedidoInicial ? conversas.find((c) => c.pedidoId === pedidoInicial)?.id : undefined));
  const [texto, setTexto] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pedidoInicial) {
      const c = conversas.find((x) => x.pedidoId === pedidoInicial);
      if (c) setSel(c.id);
    }
  }, [pedidoInicial, conversas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const atual = lista.find((c) => c.id === sel) ?? lista[0];
  useEffect(() => {
    if (atual) marcarLida(atual.id, lado);
    endRef.current?.scrollIntoView({ block: "end" });
  }, [atual?.id, atual?.mensagens.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtradas = lista.filter((c) => `${lado === "cliente" ? c.loja : c.cliente} ${c.pedidoId}`.toLowerCase().includes(q.toLowerCase()));
  const statusDe = (pid: string) => pedidosCliente.find((p) => p.id === pid)?.status ?? pedidosLoja.find((p) => p.id === pid)?.status;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atual || !texto.trim()) return;
    enviarMensagem(atual.id, lado, { texto: texto.trim() });
    setTexto("");
  };
  const anexar = (f: File | undefined) => {
    if (!f || !atual) return;
    const erro = chatAnexoErro(f.type, f.size);
    if (erro) return toast.error(erro);
    const r = new FileReader();
    r.onload = () => enviarMensagem(atual.id, lado, { imagem: String(r.result) });
    r.readAsDataURL(f);
  };

  const produto = atual ? getProduto(atual.produtoId) : undefined;
  const st = atual ? statusDe(atual.pedidoId) : undefined;

  return (
    <div className="grid h-[640px] overflow-hidden rounded-2xl border bg-card md:grid-cols-[300px_1fr]">
      <div className="flex min-h-0 flex-col border-r">
        <div className="border-b p-4">
          <h2 className="font-bold">Mensagens</h2>
          <p className="text-xs text-muted-foreground">Canal direto entre Cliente e Empresa</p>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={lado === "cliente" ? "Buscar por loja ou pedido..." : "Buscar por cliente ou pedido..."} className="h-9 w-full rounded-full border bg-background pl-9 pr-3 text-sm outline-none focus:border-brand" />
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {filtradas.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Nenhuma conversa.</li>}
          {filtradas.map((c) => {
            const last = c.mensagens.at(-1);
            const unread = lado === "cliente" ? c.naoLidasCliente : c.naoLidasLoja;
            return (
              <li key={c.id}>
                <button onClick={() => setSel(c.id)} className={`w-full border-b p-4 text-left transition hover:bg-accent ${atual?.id === c.id ? "bg-accent" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{lado === "cliente" ? c.loja : c.cliente}</span>
                    {unread > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{unread}</span>}
                  </div>
                  <div className="mt-1"><Pill>Pedido #{c.pedidoId}</Pill></div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{last ? (last.texto ?? "📷 Imagem") : "Nova conversa"}</p>
                  {last && <p className="text-[10px] text-muted-foreground">{dateTimeBR(last.data)}</p>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {atual ? (
        <div className="flex min-h-0 flex-col">
          <div className="border-b p-4">
            <div className="font-bold">{lado === "cliente" ? atual.loja : atual.cliente}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success" /> {lado === "cliente" ? "Loja Online · Tempo de resposta: ~15 min" : "Cliente"}</div>
          </div>
          {produto && (
            <div className="flex items-center gap-3 border-b bg-secondary/60 p-3">
              <img src={produto.fotos[0]} alt="" className="size-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <div className="truncate font-semibold">{produto.titulo}</div>
                <div className="text-xs text-muted-foreground">Vinculado: Pedido #{atual.pedidoId}{st && <> · Status: {statusPedidoLabel[st]}</>}</div>
              </div>
              {lado === "cliente" && pedidosCliente.some((p) => p.id === atual.pedidoId) ? (
                <Link to="/conta/pedidos/$id" params={{ id: atual.pedidoId }} className="text-sm font-semibold text-brand">Ver Pedido ›</Link>
              ) : lado === "loja" ? (
                <Link to="/painel/pedidos" className="text-sm font-semibold text-brand">Ver Pedido ›</Link>
              ) : null}
            </div>
          )}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {atual.mensagens.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Envie a primeira mensagem.</p>}
            {atual.mensagens.map((m) => {
              const mine = m.de === lado;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {m.imagem && <img src={m.imagem} alt="Anexo" className="mb-1 max-h-48 rounded-lg" />}
                    {m.texto && <p>{m.texto}</p>}
                    <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{dateTimeBR(m.data)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <form onSubmit={enviar} className="flex items-center gap-2 border-t p-3">
            <input ref={fileRef} type="file" accept="image/webp" className="hidden" onChange={(e) => { anexar(e.target.files?.[0]); e.target.value = ""; }} />
            <Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Anexar foto (WebP até 80 KB)"><Paperclip /></Button>
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva sua mensagem..." className="h-10 flex-1 rounded-full border bg-background px-4 text-sm outline-none focus:border-brand" />
            <Button type="submit"><Send /> Enviar</Button>
          </form>
        </div>
      ) : (
        <div className="grid place-items-center p-10 text-sm text-muted-foreground">Selecione uma conversa.</div>
      )}
    </div>
  );
}
