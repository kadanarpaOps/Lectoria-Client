import type { AppTheme } from "../../hooks/useTheme";

const darkModeImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuByGtMXMwNVspExMucd13SO2nJ5VQW3I_E3wpcZyxoe4UrO_tlv9nyJ5KL-N7sL_SryirVa5EYPBUC-XnZ48Q5L5SASLRKvF0J8lOXvxvT5MNf6T1MJswE9PAeNwU9nA3HQYtWhC0jKNa5wA2KfoLiY63JVWmgVTSmPfEye9PQlkozt5IzJPJIW0l9d5glSLFlZtbL0BGpY9NPUmbYaD3b2WFexe_7ndFdz189_GHrNW9oK2z9Bd3mNMSYwj7l6Hi_0vVLCgdoI9Xo";

type RegisterLeftPanelProps = {
    theme: AppTheme;
};

const RegisterLeftPanel = ({ theme }: RegisterLeftPanelProps) => {
  const isDark = theme === "dark";

  return (
    <>
        <div className="auth-reveal [--d:300] relative z-20">
            <h1 className={`text-3xl font-semibold tracking-tighter ${isDark ? "text-[#DCD7BA]" : "text-global"}`}>
                Lectoria
            </h1>
            <p className={`auth-reveal [--d:500] text-xs mt-2 font-light tracking-wide italic ${isDark ? "text-[#C8C093]" : "text-[#2B3328]"}`}>
                Tu Biblioteca Personal
            </p>
        </div>
        <div className="absolute inset-0 z-0">
            <img
            src={isDark ? darkModeImage : "/images/hero-bg.webp"}
            alt=""
            className={`w-full h-full object-cover ${isDark ? "brightness-75" : "brightness-125"}`}
            />
        </div>
        <div className={`absolute inset-0 z-10 ${isDark ? "bg-[#16161D]/25" : "bg-[#DCD7BA]/55"}`}></div>
        <div className={`absolute inset-0 z-10 bg-linear-to-r from-transparent ${isDark ? "via-[#16161D]/15 to-[#16161D]/90" : "via-[#DCD7BA]/15 to-[#DCD7BA]/90"}`}></div>
        <div className={`absolute inset-0 z-10 ${isDark ? "shadow-[inset_0_0_80px_24px_rgba(22,22,29,0.3)]" : "shadow-[inset_0_0_80px_24px_rgba(22,22,29,0.12)]"}`}></div>
        <div className="auth-reveal [--d:800] mt-auto z-20 max-w-xs">
            <p className={`text-2xl font-light leading-relaxed italic ${isDark ? "text-[#DCD7BA]" : "text-[#252535]"}`}>
                "Toda gran historia comienza con un trazo de tinta bajo la luna."
            </p>
            <div className="h-1 w-12 bg-high-enfasis mt-6"></div>
        </div>
    </>
  )
}

export default RegisterLeftPanel
