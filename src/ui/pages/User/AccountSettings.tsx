import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { AtSign, CheckCircle2, KeyRound, Mail, ShieldAlert, TriangleAlert } from "lucide-react";
import { UserService } from "../../../core/use-cases/UserUseCases";
import type { VerificationType } from "../../../core/domain/models/verify/VerificationModel";
import VerificationDialog from "../../components/verification/VerificationDialog";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const userService = new UserService();

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const primaryBtn =
  "cursor-pointer rounded-full bg-high-enfasis px-6 py-3 text-sm font-semibold text-on-primary shadow-lg shadow-high-enfasis/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-high-enfasis/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis focus-visible:ring-offset-2 focus-visible:ring-offset-background-global disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const inputCls =
  "w-full rounded-xl border border-toolbar-bg/20 bg-background-global px-4 py-3 text-global placeholder:text-several-light/60 outline-none transition-colors focus:border-high-enfasis focus:ring-2 focus:ring-high-enfasis/30";

const dialogInputCls =
  "mt-2 w-full rounded-xl border border-toolbar-bg/20 bg-inputs-bg px-4 py-3 text-global outline-none transition-colors focus:border-high-enfasis focus:ring-2 focus:ring-high-enfasis/30";

// ─── Tarjeta de ajustes ───────────────────────────────────────────────────────
function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="group relative overflow-hidden rounded-3xl border border-toolbar-bg/20 bg-surface-container-high p-5 shadow-lg shadow-black/5 transition-colors hover:border-high-enfasis/30 sm:p-7">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-high-enfasis/25 bg-high-enfasis/10 text-high-enfasis">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-global sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-several-light">{description}</p>
        </div>
      </div>
      <div className="space-y-4 sm:pl-15">{children}</div>
    </section>
  );
}

// ─── Vista ────────────────────────────────────────────────────────────────────
export default function AccountSettings() {
  const { authUser, setModifiedAuthUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState(authUser?.username ?? "");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verificationType, setVerificationType] = useState<VerificationType | null>(null);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!authUser) return null;

  const updateUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await userService.updateUsername({ newUsername: newUsername.trim() });
      setModifiedAuthUser(true);
      setMessage({ text: "Tu nombre de usuario se actualizó.", kind: "ok" });
    } catch {
      setMessage({ text: "No se pudo actualizar el nombre de usuario.", kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  const finishVerification = async () => {
    if (verificationType === "CHANGE_EMAIL") {
      await userService.updateEmail({ newEmail: newEmail.trim() });
    } else if (verificationType === "CHANGE_PASSWORD") {
      if (newPassword !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden.");
        throw new Error("Passwords do not match");
      }
      setPasswordError(null);
      await userService.updatePassword({ newPassword });
    } else if (verificationType === "DISABLE_ACCOUNT") {
      await userService.disableAccount();
      await logout();
      navigate("/", { replace: true });
      return;
    }
    setVerificationType(null);
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setModifiedAuthUser(true);
    setMessage({ text: "Los cambios de tu cuenta se guardaron correctamente.", kind: "ok" });
  };

  const initial = (authUser.username?.[0] ?? "?").toUpperCase();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Cabecera */}
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-toolbar-bg/20 bg-surface-container-high p-6 sm:p-8">
        <span
          className="pointer-events-none absolute -right-2 -top-6 select-none text-[9rem] font-extralight leading-none text-high-enfasis/10"
          aria-hidden="true"
        >
          設
        </span>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-high-enfasis">Cuenta</p>
            <h1 className="mt-2 text-2xl font-bold text-global sm:text-3xl">Seguridad y datos personales</h1>
            <div className="mt-3 h-0.5 w-12 bg-high-enfasis/60" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-several-light">
              Los cambios sensibles se confirman con un código de un solo uso enviado a tu correo.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-toolbar-bg/20 bg-background-global/60 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-high-enfasis text-lg font-bold text-on-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-global">{authUser.username}</p>
              <p className="truncate text-xs text-several-light">{authUser.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Aviso de estado */}
      {message && (
        <div
          role="status"
          className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
          } ${message.kind === "ok" && theme === "dark" ? "text-emerald-300" : ""} ${message.kind === "error" && theme === "dark" ? "text-red-300" : ""}`}
        >
          {message.kind === "ok" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <TriangleAlert size={18} className="mt-0.5 shrink-0" />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Usuario */}
        <SettingsCard
          icon={<AtSign size={20} />}
          title="Nombre de usuario"
          description="Así te verán los demás lectores y escritores en Lectoria."
        >
          <form onSubmit={updateUsername} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-several-light">
                Usuario
              </label>
              <input
                id="username"
                required
                minLength={4}
                maxLength={30}
                pattern="[a-z0-9][a-z0-9._-]{3,29}"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                className={inputCls}
              />
              <p className="mt-2 text-xs text-several-light">
                De 4 a 30 caracteres: minúsculas, números, punto, guion y guion bajo.
              </p>
            </div>
            <button type="submit" disabled={saving || newUsername.trim() === authUser.username} className={primaryBtn}>
              {saving ? "Guardando..." : "Guardar nombre"}
            </button>
          </form>
        </SettingsCard>

        {/* Correo */}
        <SettingsCard
          icon={<Mail size={20} />}
          title="Cambiar correo"
          description="Te enviaremos un código al nuevo correo para confirmar que es tuyo."
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setVerificationType("CHANGE_EMAIL");
            }}
            className="space-y-4"
          >
            <p className="rounded-xl border border-dashed border-toolbar-bg/25 px-4 py-2.5 text-sm text-several-light">
              Correo actual: <span className="font-medium text-global">{authUser.email}</span>
            </p>
            <input
              required
              type="email"
              pattern="[\w.%+-]+@[A-Za-z\d.-]{2,}\.[a-z]{2,6}"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="Nuevo correo electrónico"
              aria-label="Nuevo correo electrónico"
              className={inputCls}
            />
            <button type="submit" className={primaryBtn}>Solicitar código</button>
          </form>
        </SettingsCard>

        {/* Contraseña */}
        <SettingsCard
          icon={<KeyRound size={20} />}
          title="Cambiar contraseña"
          description="Usa entre 7 y 30 caracteres con minúscula, mayúscula, número y símbolo."
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setVerificationType("CHANGE_PASSWORD");
            }}
          >
            <button type="submit" className={primaryBtn}>Solicitar código</button>
          </form>
        </SettingsCard>

        {/* Zona de peligro */}
        <section className="rounded-3xl border border-dashed border-red-500/40 bg-red-500/5 p-5 transition-colors sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-global sm:text-xl">Desactivar cuenta</h2>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-several-light">
                  La cuenta se desactivará después de confirmar el código enviado a tu correo.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVerificationType("DISABLE_ACCOUNT")}
              className={`shrink-0 cursor-pointer rounded-full border border-red-400/50 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:bg-red-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                theme === "light" ? "text-[#93000a]" : "text-[#ffb4ab]"
              }`}
            >
              Continuar con la desactivación
            </button>
          </div>
        </section>
      </div>

      {verificationType && (
        <VerificationDialog
          key={verificationType}
          title={
            verificationType === "CHANGE_EMAIL"
              ? "Verifica el cambio de correo"
              : verificationType === "CHANGE_PASSWORD"
                ? "Verifica el cambio de contraseña"
                : "Verifica la desactivación"
          }
          description={
            verificationType === "CHANGE_EMAIL"
              ? "Introduce el código enviado al nuevo correo que quieres asociar a tu cuenta."
              : "Introduce el código enviado al correo electrónico asociado a tu cuenta."
          }
          request={{
            verificationType,
            ...(verificationType === "CHANGE_EMAIL" ? { destinationEmail: newEmail.trim() } : {}),
          }}
          replaceIfDestinationMismatch={verificationType === "CHANGE_EMAIL"}
          completeWhenVerified={verificationType === "DISABLE_ACCOUNT"}
          verifiedContent={
            verificationType === "CHANGE_EMAIL"
              ? (submitting) => (
                  <div className="space-y-4">
                    <p className="text-sm text-several-light">
                      El nuevo correo quedó verificado. Confirma para guardarlo en tu cuenta.
                    </p>
                    <button type="submit" disabled={submitting} className={`w-full ${primaryBtn}`}>
                      {submitting ? "Guardando correo..." : "Guardar nuevo correo"}
                    </button>
                  </div>
                )
              : verificationType === "CHANGE_PASSWORD"
                ? (submitting) => (
                    <>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                        Nueva contraseña
                        <input
                          required
                          type="password"
                          minLength={7}
                          maxLength={30}
                          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{7,30}"
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            setPasswordError(null);
                          }}
                          autoComplete="new-password"
                          className={dialogInputCls}
                        />
                      </label>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                        Confirmar contraseña
                        <input
                          required
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setPasswordError(null);
                          }}
                          autoComplete="new-password"
                          className={dialogInputCls}
                        />
                      </label>
                      <p className="text-xs text-several-light">
                        Usa entre 7 y 30 caracteres con minúscula, mayúscula, número y símbolo.
                      </p>
                      {passwordError && (
                        <p role="alert" className="text-sm text-red-400">{passwordError}</p>
                      )}
                      <button type="submit" disabled={submitting} className={`w-full ${primaryBtn}`}>
                        {submitting ? "Guardando contraseña..." : "Guardar nueva contraseña"}
                      </button>
                    </>
                  )
                : undefined
          }
          onVerified={finishVerification}
          onClose={() => setVerificationType(null)}
        />
      )}
    </main>
  );
}