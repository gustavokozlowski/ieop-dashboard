import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Footer } from "../components/Footer";
import { PageLayout } from "../components/PageLayout";
import {
  type AdminUserForm,
  adminUserSchema,
  managedPerfilSchema,
  PERFIL_LABELS,
} from "../schemas/auth.schema";
import { registerUser } from "../services/auth";
import styles from "./AdminUsuariosPage.module.css";

function resolveErrorMessage(err: unknown): string {
  if (err instanceof Error && "response" in err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 409) return "Este e-mail já está cadastrado.";
    if (status === 401 || status === 403) return "Sem permissão para criar usuários.";
    if (status === 422 || status === 400) return "Dados inválidos. Verifique os campos.";
    if (status != null && status >= 500) return "Erro no servidor. Tente novamente.";
  }
  if (err instanceof TypeError) return "Não foi possível conectar ao servidor.";
  return "Erro inesperado. Tente novamente.";
}

export function AdminUsuariosPage() {
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserForm>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { nome: "", email: "", password: "", confirm: "", perfil: "gestor" },
  });

  async function onSubmit(values: AdminUserForm) {
    setOkMsg(null);
    setErrMsg(null);
    try {
      // Usa o serviço direto (não o AuthContext) — o admin NÃO é deslogado nem
      // trocado pelo novo usuário. O token do admin vai anexado pelo apiClient;
      // o backend deve autorizar a criação de perfil elevado só para admins.
      await registerUser({
        nome: values.nome.trim(),
        email: values.email.trim(),
        password: values.password,
        perfil: values.perfil,
      });
      setOkMsg(`Usuário ${values.email.trim()} criado como ${PERFIL_LABELS[values.perfil]}.`);
      reset();
    } catch (err) {
      setErrMsg(resolveErrorMessage(err));
    }
  }

  return (
    <PageLayout pageTitle="Administração" breadcrumb="Macaé / Administração">
      <div className={styles.card}>
        <h2 className={styles.title}>Criar usuário</h2>
        <p className={styles.subtitle}>
          Crie contas com perfil <b>Gestor</b> ou <b>Administrador</b>. Cadastros públicos são
          sempre <b>Somente leitura</b>.
        </p>

        {okMsg && (
          <div className={`${styles.banner} ${styles.bannerOk}`} role="status">
            ✅ {okMsg}
          </div>
        )}
        {errMsg && (
          <div className={`${styles.banner} ${styles.bannerErr}`} role="alert">
            ⚠ {errMsg}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor="nome" className={styles.label}>
              Nome completo
            </label>
            <input
              id="nome"
              className={styles.input}
              placeholder="Nome do usuário"
              autoComplete="off"
              disabled={isSubmitting}
              {...register("nome")}
            />
            {errors.nome && <span className={styles.fieldError}>{errors.nome.message}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="usuario@email.gov.br"
                autoComplete="off"
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="perfil" className={styles.label}>
                Perfil
              </label>
              <select
                id="perfil"
                className={styles.select}
                disabled={isSubmitting}
                {...register("perfil")}
              >
                {managedPerfilSchema.options.map((p) => (
                  <option key={p} value={p}>
                    {PERFIL_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="Mín. 6 caracteres"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("password")}
              />
              {errors.password && (
                <span className={styles.fieldError}>{errors.password.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm" className={styles.label}>
                Confirmar senha
              </label>
              <input
                id="confirm"
                type="password"
                className={styles.input}
                placeholder="Repita a senha"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("confirm")}
              />
              {errors.confirm && (
                <span className={styles.fieldError}>{errors.confirm.message}</span>
              )}
            </div>
          </div>

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? "Criando…" : "Criar usuário"}
          </button>
        </form>
      </div>

      <Footer />
    </PageLayout>
  );
}
