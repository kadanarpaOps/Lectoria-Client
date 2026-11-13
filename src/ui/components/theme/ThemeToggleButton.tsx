import { Moon, Sun } from "lucide-react";
import type { AppTheme } from "../../hooks/useTheme";

type ThemeToggleButtonProps = {
  theme: AppTheme;
  onToggle: () => void;
  className: string;
};

const ThemeToggleButton = ({ theme, onToggle, className }: ThemeToggleButtonProps) => {
  const nextThemeLabel = theme === "dark" ? "Activar tema claro" : "Activar tema oscuro";

  return (
    <button
      type="button"
      aria-label={nextThemeLabel}
      aria-pressed={theme === "light"}
      title={nextThemeLabel}
      onClick={onToggle}
      className={className}
    >
      {theme === "dark"
        ? <Sun size={24} aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-45" />
        : <Moon size={24} aria-hidden="true" className="transition-transform duration-500 group-hover:-rotate-12" />}
    </button>
  );
};

export default ThemeToggleButton;
