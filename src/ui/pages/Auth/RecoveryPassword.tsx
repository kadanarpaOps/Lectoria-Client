import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import type { VerificationRequest } from "../../../core/domain/models/verify/VerificationModel";
import { UserService } from "../../../core/use-cases/UserUseCases";
import VerificationDialog from "../../components/verification/VerificationDialog";
import VerificationBreadcrumbs from "../../components/verification/VerificationBreadcrumbs";
import { useAuth } from "../../hooks/useAuth";
import { verifyRegistrationRequest } from "../../../infrastructure/api/requests/user.request";

const userService = new UserService();

export default function RecoveryPassword() {
  const { authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const resumeRegistration = new URLSearchParams(location.search).get("mode") === "registry";
  const identitySteps = resumeRegistration
    ? ["Buscar registro", "Código"]
    : ["Identificación", "Código", "Nueva contraseña"];
  const [identityType, setIdentityType] = useState<"username" | "userEmail">("userEmail");
  const [identity, setIdentity] = useState("");
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const requestVerification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = identity.trim();
    if (!value) return;
    setPasswordError(null);
    setVerificationRequest({
      [identityType]: value,
      verificationType: resumeRegistration ? "VERIFY_REGISTRY" : "FORGOT_PASSWORD",
    });
  };

  const completePasswordReset = async () => {
    if (!verificationRequest) return;
    if (password !== confirmation) {
      setPasswordError("Las contraseñas no coinciden.");
      throw new Error("Passwords do not match");
    }
    setPasswordError(null);
    await userService.resetPassword({
      username: verificationRequest.username,
      userEmail: verificationRequest.userEmail,
      newPassword: password,
    });
    navigate("/auth", { replace: true, state: { passwordReset: true } });
  };

  return (
    <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-black/70 px-5 py-6 backdrop-blur-sm">
      {verificationRequest && (
        <VerificationDialog
          embedded
          request={verificationRequest}
          title={resumeRegistration ? "Continúa tu registro" : "Verifica tu identidad"}
          description={resumeRegistration
            ? "Introduce el código enviado al correo de tu registro para terminar de activar la cuenta."
            : "Introduce el código enviado para continuar con la recuperación de tu contraseña."}
          createIfMissing={!resumeRegistration}
          completeWhenVerified={resumeRegistration}
          maxRegenerations={resumeRegistration ? 1 : undefined}
          stepLabels={resumeRegistration ? identitySteps : undefined}
          notFoundMessage="No encontramos un registro pendiente de verificación para esos datos."
          onVerified={async () => {
            if (resumeRegistration) {
              await verifyRegistrationRequest(verificationRequest.username, verificationRequest.userEmail);
              navigate("/auth", { replace: true });
              return;
            }
            await completePasswordReset();
          }}
          verifiedContent={resumeRegistration ? undefined : (submitting) => (
            <>
              <p className="text-sm text-several-light">La identidad está verificada. Ahora puedes elegir una contraseña nueva.</p>
              <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                Nueva contraseña
                <input
                  type="password"
                  required
                  minLength={7}
                  maxLength={30}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{7,30}"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-inputs-bg px-5 py-4 text-global outline-none focus:ring-2 focus:ring-high-enfasis"
                />
              </label>
              <p className="text-xs text-several-light">Usa entre 7 y 30 caracteres con minúscula, mayúscula, número y símbolo.</p>
              <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                Confirma la nueva contraseña
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-inputs-bg px-5 py-4 text-global outline-none focus:ring-2 focus:ring-high-enfasis"
                />
              </label>
              {passwordError && <p role="alert" className="text-sm text-red-400">{passwordError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-high-enfasis py-3.5 font-semibold text-white transition hover:scale-[0.98] active:scale-95 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Guardando contraseña..." : "Guardar contraseña"}
              </button>
            </>
          )}
          onClose={() => setVerificationRequest(null)}
        />
      )}

      <section className={`${verificationRequest ? "hidden" : ""} w-full max-w-xl rounded-3xl border border-toolbar-bg/10 bg-background-global p-8 shadow-2xl`}>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-high-enfasis/10 text-high-enfasis"><KeyRound /></div>
        <h1 className="text-3xl font-bold text-global">{resumeRegistration ? "Retomar registro" : "Recuperar acceso"}</h1>
        {authUser ? (
          <div className="mt-5 space-y-4">
            <p className="text-several-light">La recuperación mediante código es un flujo público. Como ya iniciaste sesión, puedes cambiar tu contraseña desde los ajustes de seguridad.</p>
            <Link to="/settings" className="inline-flex items-center gap-2 rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Abrir ajustes de seguridad</Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-several-light">
              {resumeRegistration
                ? "Busca la verificación pendiente para continuar con el registro."
                : "Elige un único dato para localizar tu cuenta. Te enviaremos un código antes de permitirte cambiar la contraseña."}
            </p>
            <div className="mt-6">
              <VerificationBreadcrumbs steps={identitySteps} activeStep={0} />
            </div>
            <form onSubmit={requestVerification} className="mt-6 space-y-4">
              <fieldset className="flex gap-5 text-sm text-several-light">
                <legend className="mb-2 text-xs font-semibold uppercase tracking-widest">Buscar por</legend>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={identityType === "userEmail"} onChange={() => { setIdentityType("userEmail"); setIdentity(""); }} />
                  Correo electrónico
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={identityType === "username"} onChange={() => { setIdentityType("username"); setIdentity(""); }} />
                  Nombre de usuario
                </label>
              </fieldset>
              <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                {identityType === "username" ? "Nombre de usuario" : "Correo electrónico"}
                <input
                  required
                  type={identityType === "userEmail" ? "email" : "text"}
                  autoComplete={identityType === "userEmail" ? "email" : "username"}
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-inputs-bg px-5 py-4 text-global outline-none focus:ring-2 focus:ring-high-enfasis"
                  placeholder={identityType === "username" ? "Tu nombre de usuario" : "tu@correo.com"}
                />
              </label>
              <button type="submit" className="w-full rounded-full bg-high-enfasis py-3.5 font-semibold text-white transition hover:opacity-90">
                {resumeRegistration ? "Buscar registro pendiente" : "Continuar"}
              </button>
            </form>
            <Link to="/auth" className="mt-5 inline-flex items-center gap-2 text-sm text-several-light hover:text-global"><ArrowLeft size={16} /> Volver al inicio de sesión</Link>
          </>
        )}
      </section>
    </main>
  );
}
