import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { Field } from "@/components/shop/Field";
import { maskCard, onlyDigits } from "@/lib/format";
import { useStore, type Cartao } from "@/lib/store";
import { cardBrand, isValidLuhn } from "@/lib/validators";

export const Route = createFileRoute("/conta/cartoes")({
  head: () => ({
    meta: [
      { title: "Meus cartões — mercado." },
      { name: "description", content: "Gerencie seus cartões de crédito salvos." },
      { property: "og:title", content: "Meus cartões — mercado." },
      { property: "og:description", content: "Carteira digital do cliente." },
    ],
  }),
  component: () => <AccountLayout><Cartoes /></AccountLayout>,
});

function Cartoes() {
  const { cartoes, addCartao, removeCartao, updateCartao } = useStore();
  const [num, setNum] = useState("");
  const [nome, setNome] = useState("");
  const [val, setVal] = useState("");
  const [cvv, setCvv] = useState("");
  const [apelido, setApelido] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [edit, setEdit] = useState<string | null>(null);
  const digits = onlyDigits(num);
  const luhnOk = digits.length >= 13 && isValidLuhn(digits);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!isValidLuhn(digits)) er.num = "Número de cartão inválido pelo algoritmo de Luhn";
    if (nome.trim().length < 3) er.nome = "Informe o nome gravado no cartão";
    const m = val.match(/^(\d{2})\/(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) er.val = "Use o formato MM/AA";
    else {
      const exp = new Date(2000 + Number(m[2]), Number(m[1]));
      if (exp < new Date()) er.val = "Cartão vencido";
    }
    if (!/^\d{3,4}$/.test(cvv)) er.cvv = "CVV deve ter 3 ou 4 dígitos";
    setErr(er);
    if (Object.keys(er).length) return;
    addCartao({ bandeira: cardBrand(digits), final: digits.slice(-4), titular: nome.toUpperCase(), mes: m![1], ano: m![2], apelido: apelido || "Meu cartão" });
    setNum(""); setNome(""); setVal(""); setCvv(""); setApelido("");
    toast.success("Cartão salvo");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meus Cartões Salvos</h1>
      <p className="flex items-center gap-2 rounded-xl bg-success-soft p-3 text-sm text-success"><ShieldCheck className="size-4" /> Dados protegidos por criptografia e tokenização de segurança.</p>
      {cartoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Nenhum cartão cadastrado</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cartoes.map((c, i) => (
            <div key={c.id}>
              <div className={`flex aspect-[1.7] flex-col justify-between rounded-2xl p-5 text-primary-foreground shadow-lift ${i % 2 ? "bg-card-brand" : "bg-card-dark"}`}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{c.apelido}</span><span className="font-display font-bold">{c.bandeira}</span></div>
                <div className="font-mono text-lg tracking-widest">**** **** **** {c.final}</div>
                <div className="flex justify-between text-xs uppercase opacity-80"><span>{c.titular}</span><span>{c.mes}/{c.ano}</span></div>
              </div>
              {edit === c.id ? (
                <EditCard c={c} onDone={(d) => { if (d) updateCartao(c.id, d); setEdit(null); }} />
              ) : (
                <div className="mt-2 flex gap-4 text-sm">
                  <button onClick={() => setEdit(c.id)} className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"><Pencil className="size-3.5" /> Editar apelido/validade</button>
                  <button onClick={() => { removeCartao(c.id); toast("Cartão excluído"); }} className="flex items-center gap-1 font-semibold text-destructive"><Trash2 className="size-3.5" /> Excluir Cartão</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={save} className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="font-bold">+ Cadastrar Novo Cartão</h2>
        <div className="relative">
          <Field label="Número do Cartão (validado pelo algoritmo de Luhn)" inputMode="numeric" value={num} onChange={(e) => setNum(maskCard(e.target.value))} error={err.num} />
          {digits.length >= 13 && (
            <span className={`absolute right-3 top-9 flex items-center gap-1 text-xs font-semibold ${luhnOk ? "text-success" : "text-destructive"}`}>
              {luhnOk ? <><Check className="size-3.5" /> Válido</> : <><X className="size-3.5" /> Inválido</>}
            </span>
          )}
        </div>
        <Field label="Nome Gravado no Cartão" value={nome} onChange={(e) => setNome(e.target.value)} error={err.nome} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mês/Ano" placeholder="MM/AA" value={val} onChange={(e) => setVal(onlyDigits(e.target.value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2"))} error={err.val} />
          <Field label="CVV" inputMode="numeric" maxLength={4} value={cvv} onChange={(e) => setCvv(onlyDigits(e.target.value))} error={err.cvv} />
        </div>
        <Field label="Apelido" placeholder="Ex: Meu Cartão Principal" value={apelido} onChange={(e) => setApelido(e.target.value)} />
        <Button type="submit">Salvar Cartão</Button>
      </form>
    </div>
  );
}

function EditCard({ c, onDone }: { c: Cartao; onDone: (d?: Partial<Cartao>) => void }) {
  const [apelido, setApelido] = useState(c.apelido);
  const [val, setVal] = useState(`${c.mes}/${c.ano}`);
  return (
    <div className="mt-2 space-y-2 rounded-xl border bg-card p-3">
      <Field label="Apelido" value={apelido} onChange={(e) => setApelido(e.target.value)} />
      <Field label="Validade" value={val} onChange={(e) => setVal(onlyDigits(e.target.value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2"))} />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { const [mes, ano] = val.split("/"); if (!ano) return toast.error("Validade inválida"); onDone({ apelido, mes, ano }); }}>Salvar</Button>
        <Button size="sm" variant="outline" onClick={() => onDone()}>Cancelar</Button>
      </div>
    </div>
  );
}
