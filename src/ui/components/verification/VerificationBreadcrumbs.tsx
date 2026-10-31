interface VerificationBreadcrumbsProps {
  steps: string[];
  activeStep: number;
}

export default function VerificationBreadcrumbs({ steps, activeStep }: VerificationBreadcrumbsProps) {
  return (
    <nav aria-label="Pasos de la verificación" className="mb-6">
      <ol className="flex items-start">
        {steps.map((step, index) => (
          <li key={step} aria-current={index === activeStep ? "step" : undefined} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-col items-center text-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index <= activeStep ? "bg-high-enfasis text-white" : "bg-toolbar-bg/20 text-several-light"}`}>
                {index + 1}
              </span>
              <span className={`mt-2 text-[10px] font-semibold uppercase tracking-wide ${index === activeStep ? "text-high-enfasis" : "text-several-light"}`}>{step}</span>
            </div>
            {index < steps.length - 1 && <span className={`mx-2 mt-3 h-px flex-1 ${index < activeStep ? "bg-high-enfasis" : "bg-toolbar-bg/20"}`} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
