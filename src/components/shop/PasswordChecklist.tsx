import { Check, X } from "lucide-react";
import { passwordChecks } from "@/lib/validators";

export function PasswordChecklist({ pw, personal }: { pw: string; personal: string[] }) {
  const c = passwordChecks(pw, personal);
  const items: [boolean, string][] = [
    [c.length, "8 a 16 caracteres"],
    [c.mixedCase, "Maiúscula e minúscula"],
    [c.number, "Ao menos 1 número"],
    [c.noPersonal, "Sem dados pessoais"],
  ];
  return (
    <ul className="grid grid-cols-2 gap-1.5 rounded-xl bg-secondary p-3 text-xs">
      {items.map(([ok, label]) => (
        <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-success" : "text-muted-foreground"}`}>
          {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />} {label}
        </li>
      ))}
    </ul>
  );
}
