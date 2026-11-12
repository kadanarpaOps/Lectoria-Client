import {
  Check,
  CircleCheck,
  KeyRound,
  LockKeyhole,
  MailCheck,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

interface VerificationBreadcrumbsProps {
  steps: string[];
  activeStep: number;
}

function stepIcon(label: string) {
  const normalized = label.toLocaleLowerCase();
  if (normalized.includes("buscar") || normalized.includes("identific") || normalized.includes("identidad")) return Search;
  if (normalized.includes("código") || normalized.includes("codigo")) return LockKeyhole;
  if (normalized.includes("correo") || normalized.includes("email")) return MailCheck;
  if (normalized.includes("contraseña") || normalized.includes("password")) return KeyRound;
  if (normalized.includes("desactiv") || normalized.includes("cuenta")) return UserRound;
  if (normalized.includes("confirm")) return CircleCheck;
  return ShieldCheck;
}

export default function VerificationBreadcrumbs({ steps, activeStep }: VerificationBreadcrumbsProps) {
  return (
    <nav aria-label="Pasos de la verificación" className="mb-8 w-full overflow-visible px-2 py-2">
      <ol className="mx-auto flex w-full max-w-2xl items-start justify-center">
        {steps.map((step, index) => {
          const Icon = stepIcon(step);
          const completed = index < activeStep;
          const active = index === activeStep;

          return (
            <li
              key={step}
              aria-current={active ? "step" : undefined}
              className="relative flex min-w-0 flex-1 flex-col items-center text-center"
            >
              {index < steps.length - 1 && (
                <span className="absolute left-1/2 right-[-50%] top-5 h-0.5 rounded-full bg-toolbar-bg/20">
                  <span
                    className={`block h-full rounded-full bg-high-enfasis transition-[width] duration-700 ease-out ${completed ? "w-full" : "w-0"}`}
                  />
                </span>
              )}
              <span
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
                  active
                    ? "scale-105 border-high-enfasis bg-high-enfasis/15 text-high-enfasis shadow-[0_0_20px_rgba(200,185,122,0.28)]"
                    : completed
                      ? "border-high-enfasis/60 bg-high-enfasis text-background-global"
                      : "border-toolbar-bg/25 bg-background-global text-several-light"
                }`}
              >
                {completed ? <Check size={18} strokeWidth={2.5} /> : <Icon size={18} />}
                {active && <span className="absolute inset-[-4px] rounded-full border border-high-enfasis/30 animate-ping" />}
              </span>
              <span className={`mt-2 max-w-28 text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-xs ${active ? "text-high-enfasis" : completed ? "text-global" : "text-several-light"}`}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
