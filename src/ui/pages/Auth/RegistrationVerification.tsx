import { useLocation, useNavigate } from "react-router";
import VerificationDialog from "../../components/verification/VerificationDialog";
import { verifyRegistrationRequest } from "../../../infrastructure/api/requests/user.request";

interface VerificationState {
  username?: string;
  email?: string;
}

export default function RegistrationVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as VerificationState;
  const username = state.username;
  const email = state.email;

  if (!username || !email) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="max-w-lg rounded-3xl bg-background-global p-8 text-center">
          <h1 className="text-2xl font-bold text-global">Verificación de registro</h1>
          <p className="mt-3 text-several-light">Regístrate o inicia sesión para continuar.</p>
          <button onClick={() => navigate("/auth")} className="mt-6 rounded-full bg-high-enfasis px-6 py-3 font-semibold text-white">
            Ir a iniciar sesión
          </button>
        </section>
      </main>
    );
  }

  return (
    <VerificationDialog
      title="Confirma tu correo"
      description="Introduce el código enviado al correo con el que creaste tu cuenta."
      request={{
        username,
        destinationEmail: email,
        verificationType: "VERIFY_REGISTRY",
      }}
      createIfMissing={false}
      onVerified={async () => {
        await verifyRegistrationRequest(username);
        navigate("/auth", { replace: true });
      }}
      onClose={() => navigate("/auth", { replace: true })}
    />
  );
}
