import { Check } from "lucide-react";

type Step = {
  id: number;
  label: string;
  icon: React.ElementType;
};

type Props = {
  steps: Step[];
  currentStep: number;
};

function Stepper({ steps, currentStep }: Props) {
  return (
    <div className="relative flex justify-between items-center mb-6">
      <div className="absolute top-6 left-0 w-full h-[2px] bg-several-light/20 -z-10" />
      {steps.map((s) => {
        const isCompleted = currentStep > s.id;
        const isActive = currentStep === s.id;
        const Icon = s.icon;

        return (
          <div key={s.id} className="flex flex-col items-center flex-1">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                ${isCompleted 
                  ? "bg-inputs-bg text-several-light border-2 border-several-light/30" 
                  : isActive 
                    ? "bg-primary-container text-on-primary-fixed"
                    : "bg-inputs-bg text-several-light/40"}
              `}
            >
              {isCompleted ? (
                <Check size={20} strokeWidth={3} />
              ) : (
                <Icon size={20} className={isActive ? "animate-pulse" : ""} />
              )}
            </div>
            
            <span 
              className={`text-[10px] font-bold tracking-widest mt-2 transition-colors duration-300
              ${isActive ? "text-primary-container" : "text-several-light/60"}`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper
