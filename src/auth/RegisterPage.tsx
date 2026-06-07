import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { LogoIcon } from "../components/icons";
import { type Perfil, type RegisterForm, registerSchema } from "../schemas/auth.schema";
import { useAuthContext } from "./AuthContext";
import styles from "./authForm.module.css";
import {
  ArrowIcon,
  CheckIcon,
  CrownIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
  ViewIcon,
} from "./authIcons";
import { LivingStage } from "./LivingStage";

// Perfis reais do backend (auth.schema.ts + permissions.ts).
const PERFIS: { id: Perfil; name: string; desc: string; icon: ReactNode }[] = [
  {
    id: "admin",
    name: "Administrador",
    desc: "Acesso total · re-treino ML",
    icon: <CrownIcon size={17} />,
  },
  {
    id: "gestor",
    name: "Gestor",
    desc: "Dashboard e consultas IA",
    icon: <ShieldIcon size={17} />,
  },
  {
    id: "readonly",
    name: "Somente leitura",
    desc: "Apenas visualização",
    icon: <ViewIcon size={17} />,
  },
];

// Medidor de força da senha — espelha o protótipo.
const STRENGTH = [
  { label: "—", color: "var(--color-border)" },
  { label: "Fraca", color: "var(--ieop-critico)" },
  { label: "Razoável", color: "var(--ieop-regular)" },
  { label: "Boa", color: "var(--ieop-bom)" },
  { label: "Forte", color: "var(--ieop-otimo)" },
] as const;

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function resolveErrorMessage(err: unknown): string {
  if (err instanceof Error && "response" in err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 409) return "Este e-mail já está cadastrado.";
    if (status === 422 || status === 400) return "Dados inválidos. Verifique os campos.";
    if (status === 429) return "Muitas tentativas. Aguarde alguns minutos.";
    if (status != null && status >= 500) return "Erro no servidor. Tente novamente.";
  }
  if (err instanceof TypeError) return "Não foi possível conectar ao servidor.";
  return "Erro inesperado. Tente novamente.";
}

export function RegisterPage() {
  const { register: registerUser } = useAuthContext();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", password: "", confirm: "", perfil: "gestor" },
  });

  const perfil = watch("perfil");
  const pw = watch("password");
  const confirm = watch("confirm");
  const score = scorePassword(pw);
  const mismatch = confirm.length > 0 && confirm !== pw;

  async function onSubmit(values: RegisterForm) {
    setServerError(null);
    try {
      await registerUser(values.nome.trim(), values.email.trim(), values.password, values.perfil);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(resolveErrorMessage(err));
    }
  }

  return (
    <div className={styles.page}>
      <LivingStage
        headline={
          <>
            Faça parte do <em>controle</em> das obras públicas.
          </>
        }
      />

      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <div className={styles.lock}>
            <LogoIcon size={38} />
            <div className={styles.lockText}>
              <div className={styles.lockWord}>
                IE<b>OP</b>
              </div>
              <div className={styles.lockSub}>Eficiência de Obras Públicas · RJ</div>
            </div>
          </div>

          <div className={styles.formHead}>
            <div className={styles.formTitle}>Criar conta</div>
            <div className={styles.formSub}>Solicite seu acesso ao painel analítico.</div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className={styles.errorBanner} role="alert">
                <span aria-hidden>⚠</span>
                {serverError}
              </div>
            )}

            <div className={styles.field2}>
              <label htmlFor="nome" className={styles.label}>
                Nome completo
              </label>
              <div className={`${styles.inputWrap} ${errors.nome ? styles.errorWrap : ""}`}>
                <span className={styles.inputIcon}>
                  <UserIcon />
                </span>
                <input
                  id="nome"
                  type="text"
                  className={`${styles.input} ${errors.nome ? styles.error : ""}`}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.nome)}
                  disabled={isSubmitting}
                  {...register("nome")}
                />
              </div>
              {errors.nome && <span className={styles.fieldError}>{errors.nome.message}</span>}
            </div>

            <div className={styles.field2}>
              <label htmlFor="email" className={styles.label}>
                E-mail institucional
              </label>
              <div className={`${styles.inputWrap} ${errors.email ? styles.errorWrap : ""}`}>
                <span className={styles.inputIcon}>
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.error : ""}`}
                  placeholder="seu@email.gov.br"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  disabled={isSubmitting}
                  {...register("email")}
                />
              </div>
              {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
            </div>

            <div className={styles.field2}>
              <span className={styles.label}>Perfil de acesso</span>
              <div className={styles.perfilGrid} role="radiogroup" aria-label="Perfil de acesso">
                {PERFIS.map((p) => {
                  const active = perfil === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      className={`${styles.perfilCard} ${active ? styles.perfilActive : ""}`}
                      onClick={() => setValue("perfil", p.id, { shouldValidate: true })}
                      role="radio"
                      aria-checked={active}
                    >
                      {active && (
                        <span className={styles.perfilCheck}>
                          <CheckIcon size={11} />
                        </span>
                      )}
                      <span className={styles.perfilIcon}>{p.icon}</span>
                      <span className={styles.perfilName}>{p.name}</span>
                      <span className={styles.perfilDesc}>{p.desc}</span>
                    </button>
                  );
                })}
              </div>
              {errors.perfil && <span className={styles.fieldError}>{errors.perfil.message}</span>}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field2}>
                <label htmlFor="password" className={styles.label}>
                  Senha
                </label>
                <div className={`${styles.inputWrap} ${errors.password ? styles.errorWrap : ""}`}>
                  <span className={styles.inputIcon}>
                    <LockIcon />
                  </span>
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    className={`${styles.input} ${styles.hasToggle} ${errors.password ? styles.error : ""}`}
                    placeholder="Mín. 6 caracteres"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className={styles.pwToggle}
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPw}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className={styles.field2}>
                <label htmlFor="confirm" className={styles.label}>
                  Confirmar senha
                </label>
                <div
                  className={`${styles.inputWrap} ${errors.confirm || mismatch ? styles.errorWrap : ""}`}
                >
                  <span className={styles.inputIcon}>
                    <LockIcon />
                  </span>
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    className={`${styles.input} ${styles.hasToggle} ${errors.confirm || mismatch ? styles.error : ""}`}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirm) || mismatch}
                    disabled={isSubmitting}
                    {...register("confirm")}
                  />
                  <button
                    type="button"
                    className={styles.pwToggle}
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.strength}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={styles.strengthBar}
                    style={{ background: i <= score ? STRENGTH[score]!.color : undefined }}
                  />
                ))}
              </div>
              <div className={styles.strengthLabel}>
                {mismatch ? (
                  <span style={{ color: "var(--color-danger)" }}>As senhas não coincidem</span>
                ) : (
                  <>
                    Força da senha:{" "}
                    <b
                      style={{
                        color: score ? STRENGTH[score]!.color : "var(--color-text-muted)",
                      }}
                    >
                      {STRENGTH[score]!.label}
                    </b>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className={styles.spinner} aria-hidden />
                  Criando conta…
                </>
              ) : (
                <>
                  Criar conta
                  <span className={styles.btnArrow}>
                    <ArrowIcon />
                  </span>
                </>
              )}
            </button>
          </form>

          <p className={styles.foot}>
            Já tem conta?{" "}
            <Link to="/login" className={styles.footLink}>
              Entrar
            </Link>
          </p>
          <p className={styles.foot} style={{ marginTop: 10 }}>
            Ao criar a conta, você concorda com os Termos de Uso e a Política de Privacidade do
            portal.
          </p>
        </div>
      </div>
    </div>
  );
}
