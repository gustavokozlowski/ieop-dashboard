import { z } from "zod";

// ── Perfil de acesso ──────────────────────────────────────────────
//  admin    → acesso total, pode disparar re-treinamento ML
//  gestor   → acesso ao dashboard e consultas RAG
//  readonly → apenas visualização, sem RAG
export const perfilSchema = z.enum(["admin", "gestor", "readonly"]);
export type Perfil = z.infer<typeof perfilSchema>;

// Rótulos legíveis para exibição (ex.: select do cadastro).
export const PERFIL_LABELS: Record<Perfil, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  readonly: "Somente leitura",
};

// Usuário retornado por /me, /login e /register.
// perfil cai para "gestor" com `.catch` (não `.default`): o backend tipa a
// coluna como Optional[str], então contas antigas podem vir com perfil `null`
// ou fora do enum — `.default` só cobre `undefined` e deixaria o parse estourar
// (ZodError → "Erro inesperado" no login). `.catch` cobre null/valor inválido.
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  nome: z.string(),
  perfil: perfilSchema.catch("gestor"),
});
export type UserResponse = z.infer<typeof userResponseSchema>;

// Login — validação mínima (o backend valida credenciais).
export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginForm = z.infer<typeof loginSchema>;

// Cadastro — nome, e-mail, senha (mín. 6), confirmação e perfil de acesso.
export const registerSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome"),
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirm: z.string(),
    perfil: perfilSchema,
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type RegisterForm = z.infer<typeof registerSchema>;
