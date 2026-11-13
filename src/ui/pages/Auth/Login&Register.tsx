import { useState } from "react";
import LoginLeftPanel from "../../components/decorative/LoginLeftPanel";
import VerificationAssistantOrb from "../../components/decorative/VerificationAssistantOrb";
import LoginForm from "./forms/LoginForm";
import RegisterLeftPanel from "../../components/decorative/RegisterLeftPanel";
import RegisterForm from "./forms/RegisterForm";
import { useLocation } from "react-router";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggleButton from "../../components/theme/ThemeToggleButton";

export default function Auth() {

  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
          {authAction == "LOGIN" ? <LoginLeftPanel /> : <RegisterLeftPanel theme={theme} />}
        </section>
        {/** Right Panel */}
        <section
          className={
            authAction == "LOGIN"
              ? "col-span-1 md:col-span-6 bg-surface-container-low p-8 md:p-16 flex flex-col"
              : "w-full min-h-screen lg:min-h-0 lg:w-[60%] flex items-center justify-center bg-background-global px-4 py-8 sm:px-8 sm:py-12 md:px-8 lg:pl-12 lg:pr-8"
          }
        >
          <div className="flex w-full flex-col gap-6 sm:gap-8 transition-all">
            <nav className={`mx-auto flex w-full flex-wrap justify-start gap-x-6 sm:gap-x-8 ${authAction === "LOGIN" ? "max-w-md" : "max-w-lg"}`}>
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
      <ThemeToggleButton
        theme={theme}
        onToggle={toggleTheme}
        className="theme-toggle-entrance group fixed bottom-5 right-5 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-toolbar-bg/30 bg-surface-container-low text-global shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-high-enfasis/10 hover:text-high-enfasis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis active:scale-95"
      />
      <VerificationAssistantOrb />
    </main>
  );
}
