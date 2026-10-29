import { useState } from "react";
import { useNavigate } from "react-router";
import { UserService } from "../../../core/use-cases/UserUseCases";
import type { VerificationType } from "../../../core/domain/models/verify/VerificationModel";
import VerificationDialog from "../../components/verification/VerificationDialog";
import { useAuth } from "../../hooks/useAuth";

const userService = new UserService();

export default function AccountSettings() {
  const { authUser, setModifiedAuthUser, logout } = useAuth();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState(authUser?.username ?? "");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verificationType, setVerificationType] = useState<VerificationType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!authUser) return null;

  const baseRequest = {
    destinationEmail: authUser.email,
  };

  const updateUsername = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await userService.updateUsername({ newUsername: newUsername.trim() });
      setModifiedAuthUser(true);
      setMessage("Tu nombre de usuario se actualizó.");
    } catch {
      setMessage("No se pudo actualizar el nombre de usuario.");
    } finally {
      setSaving(false);
    }
  };

  const finishVerification = async () => {
    if (verificationType === "CHANGE_EMAIL") {
      await userService.updateEmail({ newEmail: newEmail.trim() });
    } else if (verificationType === "CHANGE_PASSWORD") {
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
    setModifiedAuthUser(true);
    setMessage("Los cambios de tu cuenta se guardaron correctamente.");
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-high-enfasis">Cuenta</p>
        <h1 className="mt-2 text-3xl font-bold text-global">Seguridad y datos personales</h1>
        <p className="mt-3 text-several-light">Confirma los cambios sensibles con el código de un solo uso enviado a tu correo actual.</p>
      </header>

      <div className="space-y-5">
        <form onSubmit={updateUsername} className="space-y-4 rounded-3xl border border-toolbar-bg/10 bg-background-global p-6">
          <h2 className="text-xl font-semibold text-global">Nombre de usuario</h2>
          <input required minLength={4} maxLength={30} pattern="[a-z0-9][a-z0-9._-]{3,29}" value={newUsername} onChange={(event) => setNewUsername(event.target.value)} className="w-full rounded-xl bg-inputs-bg px-4 py-3 text-global outline-none focus:ring-2 focus:ring-high-enfasis" />
          <button disabled={saving} className="rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white disabled:opacity-50">Guardar nombre</button>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); setVerificationType("CHANGE_EMAIL"); }} className="space-y-4 rounded-3xl border border-toolbar-bg/10 bg-background-global p-6">
          <h2 className="text-xl font-semibold text-global">Cambiar correo</h2>
          <p className="text-sm text-several-light">Correo actual: {authUser.email}</p>
          <input required type="email" pattern="[\w.%+-]+@[A-Za-z\d.-]{2,}\.[a-z]{2,6}" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="Nuevo correo electrónico" className="w-full rounded-xl bg-inputs-bg px-4 py-3 text-global outline-none focus:ring-2 focus:ring-high-enfasis" />
          <button className="rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Solicitar código</button>
        </form>

        <form onSubmit={(event) => { event.preventDefault(); setVerificationType("CHANGE_PASSWORD"); }} className="space-y-4 rounded-3xl border border-toolbar-bg/10 bg-background-global p-6">
          <h2 className="text-xl font-semibold text-global">Cambiar contraseña</h2>
          <input required type="password" minLength={7} maxLength={30} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{7,30}" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nueva contraseña" className="w-full rounded-xl bg-inputs-bg px-4 py-3 text-global outline-none focus:ring-2 focus:ring-high-enfasis" />
          <p className="text-xs text-several-light">Usa entre 7 y 30 caracteres con minúscula, mayúscula, número y símbolo.</p>
          <button className="rounded-full bg-high-enfasis px-5 py-3 font-semibold text-white">Solicitar código</button>
        </form>

        <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="text-xl font-semibold text-global">Desactivar cuenta</h2>
          <p className="my-3 text-sm text-several-light">La cuenta se desactivará después de confirmar el código enviado a tu correo.</p>
          <button onClick={() => setVerificationType("DISABLE_ACCOUNT")} className="rounded-full border border-red-400/40 px-5 py-3 font-semibold text-red-300">Continuar con la desactivación</button>
        </section>
      </div>
      {message && <p role="status" className="mt-5 text-sm text-high-enfasis">{message}</p>}

      {verificationType && (
        <VerificationDialog
          key={verificationType}
          title={verificationType === "CHANGE_EMAIL" ? "Verifica el cambio de correo" : verificationType === "CHANGE_PASSWORD" ? "Verifica el cambio de contraseña" : "Verifica la desactivación"}
          description="Introduce el código enviado al correo electrónico asociado a tu cuenta."
          request={{ ...baseRequest, verificationType }}
          onVerified={finishVerification}
          onClose={() => setVerificationType(null)}
        />
      )}
    </main>
  );
}
