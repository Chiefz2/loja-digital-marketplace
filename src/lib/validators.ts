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
