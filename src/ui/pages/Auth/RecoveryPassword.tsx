import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import VerificationDialog from "../../components/verification/VerificationDialog";
import type { VerificationRequest } from "../../../core/domain/models/verify/VerificationModel";
import { useAuth } from "../../hooks/useAuth";

export default function RecoveryPassword() {
  const { authUser } = useAuth();
  const [identity, setIdentity] = useState("");
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [verified, setVerified] = useState(false);

  const requestRecovery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = identity.trim();
    const isEmail = value.includes("@");
    setVerified(false);
    setVerificationRequest({
      ...(isEmail ? { userEmail: value } : { username: value }),
      verificationType: "FORGOT_PASSWORD",
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      {verificationRequest && (
        <VerificationDialog
          request={verificationRequest}
          title="Verifica tu identidad"
          description="Introduce el código enviado a tu correo para continuar con la recuperación."
          onVerified={async () => {
            setVerificationRequest(null);
            setVerified(true);
          }}
          onClose={() => setVerificationRequest(null)}
        />
      )}
      <section className="w-full max-w-xl rounded-3xl border border-toolbar-bg/10 bg-background-global p-8 shadow-2xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-high-enfasis/10 text-high-enfasis"><KeyRound /></div>
        <h1 className="text-3xl font-bold text-global">Recuperar acceso</h1>
        {authUser ? (
          <div className="mt-5 space-y-4">
            <p className="text-several-light">La recuperación mediante código es un flujo público. Como ya iniciaste sesión, puedes cambiar tu contraseña desde los ajustes de seguridad.</p>
            <Link to="/settings" className="inline-flex items-center gap-2 rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Abrir ajustes de seguridad</Link>
          </div>
        ) : verified ? (
          <div className="mt-5 space-y-4">
            <p role="status" className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">Tu identidad fue verificada.</p>
            <p className="text-several-light">
              La API de Lectoria aún no ofrece una operación para establecer una contraseña nueva durante la recuperación. No se cambió la contraseña. Inicia sesión con tu contraseña actual o contacta con soporte.
            </p>
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white"><ArrowLeft size={17} /> Volver al inicio de sesión</Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-several-light">Solicita un código para verificar tu identidad. La API permite verificar el código, pero todavía no completar el restablecimiento de contraseña.</p>
            <form onSubmit={requestRecovery} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                Correo electrónico o nombre de usuario
                <input required value={identity} onChange={(event) => setIdentity(event.target.value)} autoComplete="username" className="mt-2 w-full rounded-xl bg-inputs-bg px-5 py-4 text-global outline-none focus:ring-2 focus:ring-high-enfasis" placeholder="Tu correo o usuario" />
              </label>
              <button type="submit" className="w-full rounded-full bg-high-enfasis py-3.5 font-semibold text-white transition hover:opacity-90">Continuar</button>
            </form>
            <Link to="/auth" className="mt-5 inline-flex items-center gap-2 text-sm text-several-light hover:text-global"><ArrowLeft size={16} /> Volver al inicio de sesión</Link>
          </>
        )}
      </section>
    </main>
  );
}
