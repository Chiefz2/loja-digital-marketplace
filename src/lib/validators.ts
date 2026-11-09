import { onlyDigits } from "./format";

/** RN06 — Luhn algorithm */
export function isValidLuhn(num: string): boolean {
  const d = onlyDigits(num);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string): string {
  const d = onlyDigits(num);
  if (/^4/.test(d)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(d)) return "Elo";
  return "Cartão";
}

/** CPF with check digits */
export function isValidCPF(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += Number(d[i]) * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/** RF53 / RN21 — password checklist */
export function passwordChecks(pw: string, personal: string[] = []) {
  const lower = pw.toLowerCase();
  const tokens = personal
    .flatMap((p) => p.toLowerCase().split(/[\s@.]+/))
    .map((t) => t.replace(/\D/g, "").length >= 4 ? t.replace(/\D/g, "") : t)
    .filter((t) => t.length >= 3);
  return {
    length: pw.length >= 8 && pw.length <= 16,
    mixedCase: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    noPersonal: pw.length > 0 && !tokens.some((t) => lower.includes(t)),
  };
}
export const isStrongPassword = (pw: string, personal: string[] = []) =>
  Object.values(passwordChecks(pw, personal)).every(Boolean);

/** RN17 — refund window of 30 days after delivery */
export const REFUND_WINDOW_DAYS = 30;
export function refundDeadline(deliveredAt: string) {
  const d = new Date(deliveredAt);
  d.setDate(d.getDate() + REFUND_WINDOW_DAYS);
  return d;
}
export function canRequestRefund(deliveredAt: string | undefined, now = new Date()) {
  if (!deliveredAt) return false;
  return now <= refundDeadline(deliveredAt);
}

/** RN09 — cancel only before shipping */
export function canCancelOrder(status: string) {
  return status === "aguardando_pagamento" || status === "pago" || status === "em_preparacao";
}

/** CNPJ with check digits */
export function isValidCNPJ(cnpj: string): boolean {
  const d = onlyDigits(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = w.reduce((a, x, i) => a + x * Number(d[i]), 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

/** RF52 — margem de lucro */
export function margem(preco: number, custo: number) {
  const lucro = preco - custo;
  return { lucro, pct: preco > 0 ? (lucro / preco) * 100 : 0, prejuizo: custo > preco };
}

/** RF35 — status automático pelo estoque */
export const statusEstoque = (qtd: number) => (qtd <= 0 ? "esgotado" : "ativo");

/** RN27 — anexo do chat: WebP até 80 KB */
export const CHAT_MAX_BYTES = 80 * 1024;
export function chatAnexoErro(type: string, size: number) {
  if (type !== "image/webp") return "Envie apenas imagens no formato WebP.";
  if (size > CHAT_MAX_BYTES) return "A imagem deve ter no máximo 80 KB.";
  return null;
}

/** RF08.1 — exclusão segura de categoria */
export const podeExcluirCategoria = (qtdProdutos: number, qtdSub: number) => qtdProdutos === 0 && qtdSub === 0;
