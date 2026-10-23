import { CloudCheck, Info } from "lucide-react";
import { useEffect } from "react"

interface AlertProps {
  message: string,
  duration?: number,
  type?: string
  onClose: () => void
}

function Alert({message, duration, type, onClose}: AlertProps) {
  const isSuccess = type === "SUCCESS";
  const Icon = isSuccess ? CloudCheck : Info;

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed right-4 top-4 z-50 pointer-events-none transition-opacity ease-in-out">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto w-80 max-w-xs bg-[rgba(20,20,24,0.7)] border border-[rgba(255,255,255,0.06)] text-neutral-100 rounded-lg shadow-lg p-3 flex gap-3 backdrop-blur-sm transition-opacity items-center duration-300"
      >
        <div className="shrink-0 mt-0.5">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white ${isSuccess ? "bg-linear-to-br from-emerald-400 to-cyan-500" : "bg-linear-to-br from-pink-400 to-rose-600"}`}>
            <Icon />
          </div>
        </div>

        <div className="flex-1 text-sm leading-snug wrap-break-word">
          <p className="font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Alert
