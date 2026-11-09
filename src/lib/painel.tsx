import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { allCategorias, getLoja, produtos as catalogo, type Categoria } from "./data";
import type { StatusPedido } from "./store";

export type Perfil = "empresa" | "admin";
export type Empresa = {
  id: string;
  logo?: string | undefined;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  responsavel: string;
  ie: string;
  im: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  descricao: string;
};
export type ProdutoLoja = {
  id: string;
  titulo: string;
  categorias: string[];
  preco: number;
  custo: number;
  estoque: number;
  condicao: "novo" | "usado";
  freteGratis: boolean;
  descricao: string;
  fotos: string[];
  vendidos: number;
  status: "publicado" | "rascunho" | "inativo";
};
export type PedidoRecebido = { id: string; data: string; cliente: string; cidade: string; itens: string; total: number; status: StatusPedido };
export type Notificacao = { id: string; tipo: "critico" | "moderacao" | "pedido"; titulo: string; texto: string; email: boolean; data: string; link: "pedidos" | "mensagens" };
export type Mensagem = { id: string; de: "cliente" | "loja"; texto?: string; imagem?: string; data: string };
export type Conversa = { id: string; cliente: string; loja: string; pedidoId: string; produtoId: string; naoLidasLoja: number; naoLidasCliente: number; mensagens: Mensagem[] };
export type Usuario = { id: string; nome: string; email: string; documento: string; tipo: "cliente" | "empresa"; cadastro: string; status: "ativo" | "suspenso" | "removido"; lojaId?: string };
export type CategoriaAdmin = Categoria & { descricao: string };
export type Denuncia = { id: string; alvo: "produto" | "empresa" | "usuario"; produto: string; motivo: string; denunciante: string; loja: string; status: "aberta" | "resolvida" | "produto_inativado" };
export type AvaliacaoReportada = { id: string; produto: string; autor: string; nota: number; comentario: string; motivo: string; status: "pendente" | "mantida" | "removida" };

const ago = (d: number, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000).toISOString();

const custoPct: Record<string, number> = { "geladeira-frost-free-400l": 0.667, "fogao-5-bocas": 1.08, "lavadora-12kg": 0.7 };
const seedProdutos: ProdutoLoja[] = catalogo
  .filter((p) => p.lojaId === "tech-eletro")
  .map((p) => ({
    id: p.id,
    titulo: p.titulo,
    categorias: p.categorias,
    preco: p.preco,
    custo: Math.round(p.preco * (custoPct[p.id] ?? 0.72)),
    estoque: p.estoque,
    condicao: p.condicao,
    freteGratis: p.freteGratis,
    descricao: p.descricao,
    fotos: p.fotos,
    vendidos: p.vendidos,
    status: "publicado",
  }));

const seedEmpresa: Empresa = {
  id: "tech-eletro",
  razaoSocial: "Tech Eletro Comércio de Eletrônicos LTDA",
  nomeFantasia: "Tech Eletro Oficial",
  cnpj: "11.222.333/0001-81",
  responsavel: "Marcos Oliveira",
  ie: "123.456.789.110",
  im: "",
  telefone: "(11) 3333-4444",
  email: "loja@exemplo.com",
  cep: "04538-133",
  logradouro: "Avenida Brigadeiro Faria Lima",
  numero: "3477",
  complemento: "Sala 12",
  bairro: "Itaim Bibi",
  cidade: "São Paulo",
  uf: "SP",
  descricao: getLoja("tech-eletro")!.descricao,
};

const seedPedidos: PedidoRecebido[] = [
  { id: "98420", data: ago(0, 2), cliente: "Carlos Mendes", cidade: "Curitiba/PR", itens: "Geladeira Frost Free Duplex 400L × 1", total: 3299, status: "pago" },
  { id: "98399", data: ago(1), cliente: "Juliana Prado", cidade: "Belo Horizonte/MG", itens: "Fogão 5 Bocas Mesa de Vidro × 1", total: 1899, status: "em_preparacao" },
  { id: "98311", data: ago(4), cliente: "Roberto Alves", cidade: "Recife/PE", itens: "Smartphone Pro 512GB × 1", total: 7999, status: "enviado" },
  { id: "97315", data: ago(15), cliente: "Fernanda Lima", cidade: "Porto Alegre/RS", itens: "Lavadora de Roupas 12kg × 1", total: 2499, status: "entregue" },
];

const seedNotif: Notificacao[] = [
  { id: "n1", tipo: "critico", titulo: "Solicitação de Reembolso Aberta - Pedido #97315", texto: "A cliente Fernanda Lima solicitou reembolso alegando defeito funcional.", email: true, data: ago(0, 5), link: "mensagens" },
  { id: "n2", tipo: "moderacao", titulo: "Denúncia Recebida / Produto em Análise", texto: "O produto “Fogão 5 Bocas Mesa de Vidro Inox” recebeu uma denúncia e está em análise pela moderação.", email: true, data: ago(1), link: "pedidos" },
  { id: "n3", tipo: "pedido", titulo: "Novo Pedido Confirmado #98420", texto: "Pagamento aprovado. Prepare o envio para Curitiba/PR.", email: false, data: ago(0, 2), link: "pedidos" },
];

const seedConversas: Conversa[] = [
  {
    id: "cv1", cliente: "Ana Souza", loja: "Tech Eletro Oficial", pedidoId: "98102", produtoId: "geladeira-frost-free-400l", naoLidasLoja: 1, naoLidasCliente: 0,
    mensagens: [
      { id: "m1", de: "cliente", texto: "Olá! A geladeira acompanha manual em português?", data: ago(2, 3) },
      { id: "m2", de: "loja", texto: "Olá, Ana! Sim, o manual e o certificado de garantia vêm na caixa.", data: ago(2, 2) },
      { id: "m3", de: "cliente", texto: "Perfeito, obrigada!", data: ago(0, 1) },
    ],
  },
  {
    id: "cv2", cliente: "Carlos Mendes", loja: "Tech Eletro Oficial", pedidoId: "98420", produtoId: "geladeira-frost-free-400l", naoLidasLoja: 2, naoLidasCliente: 0,
    mensagens: [
      { id: "m4", de: "cliente", texto: "Boa tarde, qual a previsão de envio?", data: ago(0, 1) },
      { id: "m5", de: "cliente", texto: "Preciso receber até sexta.", data: ago(0, 0.5) },
    ],
  },
];

const seedUsuarios: Usuario[] = [
  { id: "u1", nome: "Ana Souza", email: "ana@exemplo.com", documento: "529.982.247-25", tipo: "cliente", cadastro: ago(240), status: "ativo" },
  { id: "u2", nome: "João Silva", email: "joao@exemplo.com", documento: "111.444.777-35", tipo: "cliente", cadastro: ago(180), status: "ativo" },
  { id: "u3", nome: "Carlos Mendes", email: "carlos@exemplo.com", documento: "390.533.447-05", tipo: "cliente", cadastro: ago(90), status: "suspenso" },
  { id: "u4", nome: "Tech Eletro Comércio de Eletrônicos LTDA", email: "loja@exemplo.com", documento: "11.222.333/0001-81", tipo: "empresa", cadastro: ago(400), status: "ativo", lojaId: "tech-eletro" },
  { id: "u5", nome: "Mundo Digital Informática LTDA", email: "contato@mundodigital.com", documento: "45.723.174/0001-10", tipo: "empresa", cadastro: ago(300), status: "ativo", lojaId: "mundo-digital" },
  { id: "u6", nome: "Casa Viva Store ME", email: "ola@casaviva.com", documento: "60.701.190/0001-04", tipo: "empresa", cadastro: ago(120), status: "ativo", lojaId: "casa-viva" },
];

const seedCategorias: CategoriaAdmin[] = allCategorias.map((c) => ({ ...c, descricao: "" }));

const seedDenuncias: Denuncia[] = [
  { id: "DEN-402", alvo: "produto", produto: "Cooktop Portátil Turbinado", motivo: "Produto sem selo do INMETRO e descrição enganosa sobre voltagem.", denunciante: "João Silva (Cliente)", loja: "Loja Fictícia Eletro", status: "aberta" },
  { id: "DEN-398", alvo: "produto", produto: "Fogão 5 Bocas Mesa de Vidro Inox", motivo: "Foto não corresponde ao produto entregue.", denunciante: "Juliana Prado (Cliente)", loja: "Tech Eletro Oficial", status: "aberta" },
];
const seedAvaliacoesRep: AvaliacaoReportada[] = [
  { id: "AV-77", produto: "Geladeira Frost Free Duplex 400L Inox", autor: "Usuário Anônimo", nota: 1, comentario: "Loja golpista!!! Comprem no site X que é mais barato www.sitex.com", motivo: "Spam / link externo", status: "pendente" },
];

type State = {
  sessao: Perfil | null;
  empresa: Empresa;
  produtos: ProdutoLoja[];
  pedidos: PedidoRecebido[];
  notificacoes: Notificacao[];
  conversas: Conversa[];
  usuarios: Usuario[];
  categorias: CategoriaAdmin[];
  denuncias: Denuncia[];
  avaliacoesRep: AvaliacaoReportada[];
  inativadosAdmin: string[];
};

const initial: State = {
  sessao: null,
  empresa: seedEmpresa,
  produtos: seedProdutos,
  pedidos: seedPedidos,
  notificacoes: seedNotif,
  conversas: seedConversas,
  usuarios: seedUsuarios,
  categorias: seedCategorias,
  denuncias: seedDenuncias,
  avaliacoesRep: seedAvaliacoesRep,
  inativadosAdmin: [],
};

const KEY = "mkt-painel-v1";

function usePainelValue() {
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
  const uid = () => Math.random().toString(36).slice(2, 10);

  const actions = useMemo(
    () => ({
      entrar: (p: Perfil) => patch(() => ({ sessao: p })),
      sair: () => patch(() => ({ sessao: null })),
      cadastrarEmpresa: (e: Empresa) => patch(() => ({ empresa: e, sessao: "empresa" })),
      updateEmpresa: (e: Partial<Empresa>) => patch((s) => ({ empresa: { ...s.empresa, ...e } })),
      salvarProduto: (p: Omit<ProdutoLoja, "id" | "vendidos"> & { id?: string }) =>
        patch((s) =>
          p.id && s.produtos.some((x) => x.id === p.id)
            ? { produtos: s.produtos.map((x) => (x.id === p.id ? { ...x, ...p, id: x.id } : x)) }
            : { produtos: [{ ...p, id: `prod-${uid()}`, vendidos: 0 }, ...s.produtos] },
        ),
      ajustarEstoque: (id: string, delta: number) =>
        patch((s) => ({ produtos: s.produtos.map((x) => (x.id === id ? { ...x, estoque: Math.max(0, x.estoque + delta) } : x)) })),
      inativarProduto: (id: string) => patch((s) => ({ produtos: s.produtos.map((x) => (x.id === id ? { ...x, status: "inativo" } : x)) })),
      reativarProduto: (id: string) => patch((s) => ({ produtos: s.produtos.map((x) => (x.id === id ? { ...x, status: "publicado" } : x)) })),
      setStatusPedido: (id: string, status: StatusPedido) =>
        patch((s) => ({ pedidos: s.pedidos.map((x) => (x.id === id ? { ...x, status } : x)) })),
      enviarMensagem: (convId: string, de: Mensagem["de"], m: { texto?: string; imagem?: string }) =>
        patch((s) => ({
          conversas: s.conversas.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  mensagens: [...c.mensagens, { id: uid(), de, ...m, data: new Date().toISOString() }],
                  naoLidasCliente: de === "loja" ? c.naoLidasCliente + 1 : c.naoLidasCliente,
                  naoLidasLoja: de === "cliente" ? c.naoLidasLoja + 1 : c.naoLidasLoja,
                }
              : c,
          ),
        })),
      marcarLida: (convId: string, quem: "cliente" | "loja") =>
        patch((s) => ({ conversas: s.conversas.map((c) => (c.id === convId ? { ...c, ...(quem === "loja" ? { naoLidasLoja: 0 } : { naoLidasCliente: 0 }) } : c)) })),
      abrirConversa: (pedidoId: string, produtoId: string, cliente: string, loja: string) => {
        let id = "";
        patch((s) => {
          const ex = s.conversas.find((c) => c.pedidoId === pedidoId);
          if (ex) { id = ex.id; return {}; }
          id = `cv-${uid()}`;
          return { conversas: [{ id, cliente, loja, pedidoId, produtoId, naoLidasLoja: 0, naoLidasCliente: 0, mensagens: [] }, ...s.conversas] };
        });
        return () => id;
      },
      setUsuarioStatus: (id: string, status: Usuario["status"]) => patch((s) => ({ usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, status } : u)) })),
      editarUsuario: (id: string, u: Partial<Usuario>) => patch((s) => ({ usuarios: s.usuarios.map((x) => (x.id === id ? { ...x, ...u } : x)) })),
      salvarCategoria: (c: { id?: string; nome: string; pai?: string | undefined; descricao: string }) =>
        patch((s) =>
          c.id
            ? { categorias: s.categorias.map((x) => (x.id === c.id ? { ...x, nome: c.nome, pai: c.pai, descricao: c.descricao } : x)) }
            : { categorias: [...s.categorias, { id: `cat-${uid()}`, nome: c.nome, pai: c.pai, descricao: c.descricao, icon: "" }] },
        ),
      excluirCategoria: (id: string) => patch((s) => ({ categorias: s.categorias.filter((x) => x.id !== id) })),
      resolverDenuncia: (id: string, status: Denuncia["status"]) => patch((s) => ({ denuncias: s.denuncias.map((d) => (d.id === id ? { ...d, status } : d)) })),
      moderarAvaliacao: (id: string, status: AvaliacaoReportada["status"]) =>
        patch((s) => ({ avaliacoesRep: s.avaliacoesRep.map((a) => (a.id === id ? { ...a, status } : a)) })),
      inativarPeloAdmin: (produtoId: string) =>
        patch((s) => ({
          inativadosAdmin: [...new Set([...s.inativadosAdmin, produtoId])],
          produtos: s.produtos.map((x) => (x.id === produtoId ? { ...x, status: "inativo" } : x)),
        })),
    }),
    [patch],
  );
  return { ...state, ready, ...actions };
}

type Painel = ReturnType<typeof usePainelValue>;
const Ctx = createContext<Painel | null>(null);
export function PainelProvider({ children }: { children: ReactNode }) {
  const v = usePainelValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export function usePainel() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePainel must be inside PainelProvider");
  return v;
}
