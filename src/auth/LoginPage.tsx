import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoIcon } from "../components/icons";
import { type LoginForm, loginSchema } from "../schemas/auth.schema";
import { useAuthContext } from "./AuthContext";
import styles from "./authForm.module.css";
import { ArrowIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "./authIcons";
import { LivingStage } from "./LivingStage";

function resolveErrorMessage(err: unknown): string {
  if (err instanceof Error && "response" in err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 401 || status === 403) return "E-mail ou senha incorretos.";
    if (status === 429) return "Muitas tentativas. Aguarde alguns minutos.";
    if (status != null && status >= 500) return "Erro no servidor. Tente novamente.";
  }
  if (err instanceof TypeError) return "Não foi possível conectar ao servidor.";
  return "Erro inesperado. Tente novamente.";
}

export function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(resolveErrorMessage(err));
    }
  }

  return (
    <div className={styles.page}>
      <LivingStage
        headline={
          <>
            Cada obra pública, <em>medida</em> e classificada.
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
            <div className={styles.formTitle}>Acesse o painel</div>
            <div className={styles.formSub}>Entre com suas credenciais institucionais.</div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className={styles.errorBanner} role="alert">
                <span aria-hidden>⚠</span>
                {serverError}
              </div>
            )}

            <div className={styles.field2}>
              <label htmlFor="email" className={styles.label}>
                E-mail
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
              <div className={styles.rowBetween}>
                <label htmlFor="password" className={styles.label}>
                  Senha
                </label>
                <Link to="/login" className={styles.link}>
                  Esqueci a senha
                </Link>
              </div>
              <div className={`${styles.inputWrap} ${errors.password ? styles.errorWrap : ""}`}>
                <span className={styles.inputIcon}>
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  className={`${styles.input} ${styles.hasToggle} ${errors.password ? styles.error : ""}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  title={showPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldError}>{errors.password.message}</span>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className={styles.spinner} aria-hidden />
                  Entrando…
                </>
              ) : (
                <>
                  Entrar
                  <span className={styles.btnArrow}>
                    <ArrowIcon />
                  </span>
                </>
              )}
            </button>
          </form>

          <div className={styles.secure}>
            <span className={styles.pulse} /> conexão segura · dados.gov.br
          </div>

          <p className={styles.foot}>
            Não tem conta?{" "}
            <Link to="/register" className={styles.footLink}>
              Solicite acesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
