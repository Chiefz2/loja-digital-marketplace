import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { avaliacoesSeed, getProduto, type Avaliacao } from "./data";

export type Usuario = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  foto?: string;
};
export type Cartao = { id: string; bandeira: string; final: string; titular: string; mes: string; ano: string; apelido: string };
export type ItemCarrinho = { produtoId: string; quantidade: number };
export type StatusPedido = "aguardando_pagamento" | "pago" | "em_preparacao" | "enviado" | "entregue" | "cancelado";
export type ItemPedido = { produtoId: string; quantidade: number; preco: number; avaliado?: boolean };
export type Pedido = {
  id: string;
  data: string;
  itens: ItemPedido[];
  subtotal: number;
  frete: number;
  total: number;
  pagamento: "cartao" | "pix" | "boleto";
  cartaoFinal?: string;
  status: StatusPedido;
  entregueEm?: string;
  endereco: string;
  nfe: { chave: string; numero: string; serie: string; emissao: string };
};
export type StatusReembolso = "solicitado" | "em_analise" | "aguardando_recebimento" | "reembolsado" | "recusado";
export type Reembolso = {
  id: string;
  pedidoId: string;
  motivo: string;
  descricao: string;
  status: StatusReembolso;
  valor: number;
  codigoReverso: string;
  data: string;
  historico: { status: StatusReembolso; data: string }[];
};

const demoUser: Usuario = {
  nome: "Ana Souza",
  cpf: "529.982.247-25",
  email: "ana@exemplo.com",
  telefone: "(11) 98765-4321",
  cep: "01310-100",
  logradouro: "Avenida Paulista",
  numero: "1000",
  complemento: "Apto 52",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  uf: "SP",
};

const nfe = (n: number) => ({
  chave: ("3526" + "1112345678000190" + "55001" + String(n).padStart(9, "0") + "1" + "12345678").slice(0, 44).padEnd(44, "0"),
  numero: String(n).padStart(6, "0"),
  serie: "001",
  emissao: new Date(2026, 9, 1).toISOString(),
});

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const seedPedidos: Pedido[] = [
  {
    id: "98417",
    data: daysAgo(3),
    itens: [{ produtoId: "smartphone-x-256", quantidade: 1, preco: 2799 }],
    subtotal: 2799,
    frete: 0,
    total: 2799,
    pagamento: "cartao",
    cartaoFinal: "4291",
    status: "em_preparacao",
    endereco: "Avenida Paulista, 1000 — Apto 52, Bela Vista, São Paulo/SP",
    nfe: { ...nfe(98417), emissao: daysAgo(3) },
  },
  {
    id: "98102",
    data: daysAgo(18),
    itens: [
      { produtoId: "geladeira-frost-free-400l", quantidade: 1, preco: 3299 },
      { produtoId: "fone-anc-wireless", quantidade: 1, preco: 899 },
    ],
    subtotal: 4198,
    frete: 0,
    total: 4198,
    pagamento: "pix",
    status: "entregue",
    entregueEm: daysAgo(10),
    endereco: "Avenida Paulista, 1000 — Apto 52, Bela Vista, São Paulo/SP",
    nfe: { ...nfe(98102), emissao: daysAgo(18) },
  },
];

const seedReembolsos: Reembolso[] = [
  {
    id: "REF-5521",
    pedidoId: "98102",
    motivo: "Produto apresentou defeito funcional",
    descricao: "O fone para de conectar via Bluetooth após alguns minutos.",
    status: "aguardando_recebimento",
    valor: 899,
    codigoReverso: "REV-892140",
    data: daysAgo(5),
    historico: [
      { status: "solicitado", data: daysAgo(5) },
      { status: "em_analise", data: daysAgo(4) },
      { status: "aguardando_recebimento", data: daysAgo(3) },
    ],
  },
];

const seedCartoes: Cartao[] = [
  { id: "c1", bandeira: "Mastercard", final: "4291", titular: "ANA SOUZA", mes: "08", ano: "29", apelido: "Nubank Pessoal" },
  { id: "c2", bandeira: "VISA", final: "8820", titular: "ANA SOUZA", mes: "03", ano: "28", apelido: "Itaú Corporativo" },
];

type State = {
  user: Usuario | null;
  cart: ItemCarrinho[];
  cartoes: Cartao[];
  pedidos: Pedido[];
  reembolsos: Reembolso[];
  avaliacoes: Avaliacao[];
};

const initial: State = {
  user: null,
  cart: [],
  cartoes: seedCartoes,
  pedidos: seedPedidos,
  reembolsos: seedReembolsos,
  avaliacoes: avaliacoesSeed,
};

const KEY = "mkt-state-v1";

function useStoreValue() {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (loaded.current) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo(
    () => ({
      login: (u?: Partial<Usuario>) => patch(() => ({ user: { ...demoUser, ...u } })),
      logout: () => patch(() => ({ user: null })),
      updateUser: (u: Partial<Usuario>) => patch((s) => ({ user: s.user ? { ...s.user, ...u } : s.user })),
      addToCart: (produtoId: string, quantidade = 1) =>
        patch((s) => {
          const p = getProduto(produtoId);
          const ex = s.cart.find((i) => i.produtoId === produtoId);
          const max = p?.estoque ?? 0;
          if (ex) return { cart: s.cart.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: Math.min(max, i.quantidade + quantidade) } : i)) };
          return { cart: [...s.cart, { produtoId, quantidade: Math.min(max, quantidade) }] };
        }),
      setQty: (produtoId: string, quantidade: number) =>
        patch((s) => ({ cart: s.cart.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: Math.max(1, quantidade) } : i)) })),
      removeFromCart: (produtoId: string) => patch((s) => ({ cart: s.cart.filter((i) => i.produtoId !== produtoId) })),
      addCartao: (c: Omit<Cartao, "id">) => patch((s) => ({ cartoes: [...s.cartoes, { ...c, id: crypto.randomUUID() }] })),
      updateCartao: (id: string, c: Partial<Cartao>) => patch((s) => ({ cartoes: s.cartoes.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeCartao: (id: string) => patch((s) => ({ cartoes: s.cartoes.filter((x) => x.id !== id) })),
      placeOrder: (input: { itens: ItemCarrinho[]; pagamento: Pedido["pagamento"]; cartaoFinal?: string; endereco: string; fromCart: boolean }) => {
        const id = String(98420 + Math.floor(Math.random() * 500));
        const itens = input.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, preco: getProduto(i.produtoId)!.preco }));
        const subtotal = itens.reduce((a, i) => a + i.preco * i.quantidade, 0);
        const frete = itens.every((i) => getProduto(i.produtoId)?.freteGratis) ? 0 : 29.9;
        const pedido: Pedido = {
          id,
          data: new Date().toISOString(),
          itens,
          subtotal,
          frete,
          total: subtotal + frete,
          pagamento: input.pagamento,
          cartaoFinal: input.cartaoFinal,
          status: input.pagamento === "boleto" ? "aguardando_pagamento" : "pago",
          endereco: input.endereco,
          nfe: { ...nfe(Number(id)), emissao: new Date().toISOString() },
        };
        patch((s) => ({ pedidos: [pedido, ...s.pedidos], cart: input.fromCart ? [] : s.cart }));
        return id;
      },
      cancelOrder: (id: string) => patch((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, status: "cancelado" } : p)) })),
      addReview: (pedidoId: string, a: Omit<Avaliacao, "id" | "data">) =>
        patch((s) => ({
          avaliacoes: [{ ...a, id: crypto.randomUUID(), data: new Date().toISOString() }, ...s.avaliacoes],
          pedidos: s.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, itens: p.itens.map((i) => (i.produtoId === a.produtoId ? { ...i, avaliado: true } : i)) } : p,
          ),
        })),
      requestRefund: (pedidoId: string, motivo: string, descricao: string, valor: number) => {
        const id = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date().toISOString();
        patch((s) => ({
          reembolsos: [
            { id, pedidoId, motivo, descricao, valor, status: "solicitado", codigoReverso: `REV-${Math.floor(100000 + Math.random() * 900000)}`, data: now, historico: [{ status: "solicitado", data: now }] },
            ...s.reembolsos,
          ],
        }));
        return id;
      },
    }),
    [patch],
  );

  return { ...state, ready, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be inside StoreProvider");
  return v;
}

export const statusPedidoLabel: Record<StatusPedido, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_preparacao: "Em preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};
