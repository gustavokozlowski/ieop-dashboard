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
// perfil cai para "readonly" com `.catch` (fail-closed / menor privilégio): o
// backend tipa a coluna como Optional[str], então contas antigas podem vir com
// `null` ou fora do enum. `.catch` cobre null/valor inválido sem quebrar o
// parse — e o fallback é o perfil MENOS privilegiado, nunca um elevado.
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  nome: z.string(),
  perfil: perfilSchema.catch("readonly"),
});
export type UserResponse = z.infer<typeof userResponseSchema>;

// Login — validação mínima (o backend valida credenciais).
export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginForm = z.infer<typeof loginSchema>;

// Cadastro PÚBLICO — nome, e-mail, senha (mín. 6) e confirmação. NÃO inclui
// perfil: toda conta criada pelo cadastro público é `readonly` (forçado no
// AuthContext). Perfis elevados só pelo backoffice (admin) → adminUserSchema.
export const registerSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome"),
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type RegisterForm = z.infer<typeof registerSchema>;

// Perfis que um admin pode atribuir no backoffice (readonly é só cadastro
// público). Restringe a UI a gestor/admin.
export const managedPerfilSchema = z.enum(["gestor", "admin"]);
export type ManagedPerfil = z.infer<typeof managedPerfilSchema>;

// Backoffice (admin) — criação de usuário com perfil elevado (gestor/admin).
export const adminUserSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirm: z.string(),
    perfil: managedPerfilSchema,
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type AdminUserForm = z.infer<typeof adminUserSchema>;
