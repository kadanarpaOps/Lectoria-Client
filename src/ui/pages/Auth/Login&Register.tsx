import { useState } from "react";
import LoginLeftPanel from "../../components/decorative/LoginLeftPanel";
import LoginForm from "./forms/LoginForm";
import RegisterLeftPanel from "../../components/decorative/RegisterLeftPanel";
import RegisterForm from "./forms/RegisterForm";
import { useLocation, useNavigate } from "react-router";

function VerificationOrb() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="fixed bottom-5 left-5 z-40"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className={`absolute bottom-16 left-0 w-56 origin-bottom-left rounded-2xl border border-[#c8b97a]/30 bg-background-global p-2 shadow-2xl transition duration-300 ${open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"}`}>
        <button
          type="button"
          onClick={() => navigate("/recovery-pass?mode=registry")}
          className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-global transition hover:bg-high-enfasis/15"
        >
          Continuar registro
        </button>
        <button
          type="button"
          onClick={() => navigate("/recovery-pass")}
          className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-global transition hover:bg-high-enfasis/15"
        >
          Olvidé mi contraseña
        </button>
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Abrir opciones de verificación"
        onClick={() => setOpen((value) => !value)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-[#e6d79d]/80 bg-[radial-gradient(circle_at_30%_25%,#fff5bf_0%,#d1b95c_22%,#806b36_55%,#242437_78%)] shadow-[0_0_24px_rgba(200,185,122,0.5)] transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-high-enfasis"
      >
        <span className="absolute inset-1 rounded-full border border-white/40 animate-[spin_8s_linear_infinite]" />
        <span className="absolute -inset-2 rounded-full border border-[#c8b97a]/20 animate-ping" />
        <span className="relative text-xl text-[#fff5bf] drop-shadow">✦</span>
      </button>
    </div>
  );
}

export default function Auth() {

  const location = useLocation();

  const [authAction, setAuthAction] = useState<string>(location.state?.authAction || "LOGIN");

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center overflow-x-hidden"
    >
      <div
        className={
          authAction == "LOGIN"
            ? "w-full max-w-6xl grid grid-cols-1 md:grid-cols-10 overflow-hidden rounded-xl min-h-[min(680px,calc(100vh-2rem))] drop-shadow-2xl"
            : "flex min-h-screen w-full flex-col overflow-visible lg:flex-row"
        }
      >
        {/** Left Panel */}
        <section
          className={
            authAction == "LOGIN"
              ? "hidden md:flex md:col-span-4 bg-background-global relative overflow-hidden flex-col px-12 py-8 justify-between"
              : "hidden lg:flex lg:w-[40%] bg-background-global relative overflow-hidden flex-col p-12"
          }
        >
          {authAction == "LOGIN" ? <LoginLeftPanel /> : <RegisterLeftPanel />}
        </section>
        {/** Right Panel */}
        <section
          className={
            authAction == "LOGIN"
              ? "col-span-1 md:col-span-6 bg-surface-container-low p-8 md:p-16 flex flex-col"
              : "w-full min-h-screen lg:min-h-0 lg:w-[60%] flex items-center justify-center bg-background-global px-4 py-8 sm:px-8 sm:py-12 md:px-16 lg:px-24"
          }
        >
          <div className="flex w-full flex-col gap-6 sm:gap-8 transition-all">
            <nav className="flex flex-wrap gap-x-6 sm:gap-x-8">
              <button
                className={
                  `pb-4 text-lg font-medium cursor-pointer transition-all ` +
                  (authAction == "LOGIN"
                    ? `text-high-enfasis border-b-2 border-high-enfasis`
                    : `text-several-light hover:text-global`)
                }
                onClick={() => setAuthAction("LOGIN")}
              >
                Iniciar Sesión
              </button>
              <button
                className={
                  `pb-4 text-lg font-medium transition-all cursor-pointer ` +
                  (authAction == "REGISTER"
                    ? `text-high-enfasis border-b-2 border-high-enfasis`
                    : `text-several-light hover:text-global`)
                }
                onClick={() => setAuthAction("REGISTER")}
              >
                Registrarse
              </button>
            </nav>
            {authAction == "LOGIN" ? <LoginForm /> : <RegisterForm />}
          </div>
        </section>
      </div>
      <VerificationOrb />
    </main>
  );
}
