import { useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

type OrbPosition = {
  left: number;
  top: number;
  side: "left" | "right";
};

type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

const ORB_SIZE = 64;
const EDGE_PADDING = 16;
const POSITION_STORAGE_KEY = "lectoria-verification-orb-position";

export default function VerificationAssistantOrb() {
  const [open, setOpen] = useState(false);
  const [focusedOption, setFocusedOption] = useState<"registry" | "password" | "reactivation" | null>(null);
  const [position, setPosition] = useState<OrbPosition | null>(null);
  const [orbHovered, setOrbHovered] = useState(false);
  const navigate = useNavigate();
  const orbRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as OrbPosition;
          if (Number.isFinite(parsed.left) && Number.isFinite(parsed.top)) {
            setPosition({
              left: Math.max(EDGE_PADDING, Math.min(window.innerWidth - ORB_SIZE - EDGE_PADDING, parsed.left)),
              top: Math.max(EDGE_PADDING, Math.min(window.innerHeight - ORB_SIZE - EDGE_PADDING, parsed.top)),
              side: parsed.side === "left" ? "left" : "right",
            });
            return;
          }
        } catch {
          localStorage.removeItem(POSITION_STORAGE_KEY);
        }
      }

      const mobile = window.matchMedia("(max-width: 767px)").matches;
      setPosition({
        left: window.innerWidth - ORB_SIZE - EDGE_PADDING,
        top: mobile ? window.innerHeight - ORB_SIZE - 28 : Math.round((window.innerHeight - ORB_SIZE) / 2),
        side: "right",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!position || event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 7) {
      drag.moved = true;
      setOpen(false);
    }
    if (!drag.moved) return;
    setPosition((current) => ({
      left: Math.max(EDGE_PADDING, Math.min(window.innerWidth - ORB_SIZE - EDGE_PADDING, event.clientX - drag.offsetX)),
      top: Math.max(EDGE_PADDING, Math.min(window.innerHeight - ORB_SIZE - EDGE_PADDING, event.clientY - drag.offsetY)),
      side: current?.side ?? "right",
    }));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return;

    const side = event.clientX + ORB_SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
    const nextPosition: OrbPosition = {
      left: side === "left" ? EDGE_PADDING : window.innerWidth - ORB_SIZE - EDGE_PADDING,
      top: Math.max(EDGE_PADDING, Math.min(window.innerHeight - ORB_SIZE - EDGE_PADDING, event.clientY - drag.offsetY)),
      side,
    };
    setPosition(nextPosition);
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(nextPosition));
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const onOrbClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setOpen((current) => !current);
  };

  const optionPosition = position?.side === "left"
    ? "left-full ml-5 items-start"
    : "right-full mr-5 items-end";
  const tooltipPosition = position?.side === "left"
    ? "left-0 md:left-full md:ml-4 md:right-auto"
    : "right-0 md:right-full md:mr-4 md:left-auto";

  return (
    <div
      className={`fixed z-[100] ${position ? "" : "right-4 top-1/2 -translate-y-1/2 max-md:bottom-7 max-md:top-auto max-md:translate-y-0"}`}
      style={position ? { left: position.left, top: position.top } : undefined}
    >
      {orbHovered && !open && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute bottom-full z-10 mb-3 w-max max-w-56 border border-[#f1d98c]/80 bg-[#17212b] px-3 py-2 font-mono text-[10px] leading-relaxed text-[#ffe9a8] shadow-[3px_3px_0_#080d12] animate-[fade-in_180ms_ease-out_both] sm:text-xs ${tooltipPosition}`}
        >
          Asistente para recuperar tu cuenta y continuar tu registro.
        </div>
      )}

      <div
        onMouseLeave={() => setFocusedOption(null)}
        className={`absolute top-1/2 flex -translate-y-1/2 flex-col gap-3 transition-all duration-500 ${optionPosition} ${open ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
      >
        <button
          type="button"
          onMouseEnter={() => setFocusedOption("registry")}
          onFocus={() => setFocusedOption("registry")}
          onBlur={() => setFocusedOption(null)}
          onClick={() => navigate("/recovery-pass?mode=registry")}
          className={`group flex w-52 items-center gap-3 border-2 border-[#f1d98c]/70 bg-[#17212b]/95 px-4 py-3 text-left shadow-[4px_4px_0_#080d12] transition-all duration-500 hover:border-[#ffe9a8] hover:bg-[#243541] hover:shadow-[0_0_22px_rgba(241,217,140,0.28)] active:scale-95 ${open ? "translate-x-0" : "translate-x-5"} ${focusedOption === "registry" ? "z-10 scale-105" : focusedOption === "password" ? "translate-y-[-0.5rem] scale-90 opacity-75" : "scale-100"} ${open && "animate-[fade-in_400ms_ease-out_both]"}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#f1d98c]/40 bg-[#f1d98c]/10 text-[#ffe9a8] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
            <Search size={18} />
          </span>
          <span>
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-[#ffe9a8]">Continuar registro</span>
            <span className="mt-1 block font-mono text-[10px] text-[#b8d5d2]">Retoma donde lo dejaste</span>
          </span>
          <ArrowRight size={15} className="ml-auto shrink-0 text-[#f1d98c] transition-transform group-hover:translate-x-1" />
        </button>
        <button
          type="button"
          onMouseEnter={() => setFocusedOption("password")}
          onFocus={() => setFocusedOption("password")}
          onBlur={() => setFocusedOption(null)}
          onClick={() => navigate("/recovery-pass")}
          className={`group flex w-52 items-center gap-3 border-2 border-[#92d8d0]/60 bg-[#17212b]/95 px-4 py-3 text-left shadow-[4px_4px_0_#080d12] transition-all duration-500 hover:border-[#b8f5e9] hover:bg-[#243541] hover:shadow-[0_0_22px_rgba(146,216,208,0.24)] active:scale-95 ${open ? "translate-x-0" : "translate-x-5"} ${focusedOption === "password" ? "z-10 scale-105" : focusedOption === "registry" ? "translate-y-[0.5rem] scale-90 opacity-75" : "scale-100"} ${open && "animate-[fade-in_600ms_ease-out_both]"}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#92d8d0]/40 bg-[#92d8d0]/10 text-[#b8f5e9] transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-110">
            <KeyRound size={18} />
          </span>
          <span>
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-[#b8f5e9]">Olvidé mi contraseña</span>
            <span className="mt-1 block font-mono text-[10px] text-[#b8d5d2]">Recupera el acceso seguro</span>
          </span>
          <ArrowRight size={15} className="ml-auto shrink-0 text-[#92d8d0] transition-transform group-hover:translate-x-1" />
        </button>
        <button
          type="button"
          onMouseEnter={() => setFocusedOption("reactivation")}
          onFocus={() => setFocusedOption("reactivation")}
          onBlur={() => setFocusedOption(null)}
          onClick={() => navigate("/recovery-pass?mode=reactivate")}
          className={`group flex w-52 items-center gap-3 border-2 border-[#d7b7f5]/60 bg-[#17212b]/95 px-4 py-3 text-left shadow-[4px_4px_0_#080d12] transition-all duration-500 hover:border-[#eddaff] hover:bg-[#243541] hover:shadow-[0_0_22px_rgba(215,183,245,0.24)] active:scale-95 ${open ? "translate-x-0" : "translate-x-5"} ${focusedOption === "reactivation" ? "z-10 scale-105" : focusedOption ? "scale-90 opacity-75" : "scale-100"} ${open && "animate-[fade-in_800ms_ease-out_both]"}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#d7b7f5]/40 bg-[#d7b7f5]/10 text-[#eddaff] transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-110">
            <ShieldCheck size={18} />
          </span>
          <span>
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-[#eddaff]">Reactivar cuenta</span>
            <span className="mt-1 block font-mono text-[10px] text-[#b8d5d2]">Solicita ayuda al equipo</span>
          </span>
          <ArrowRight size={15} className="ml-auto shrink-0 text-[#d7b7f5] transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <button
        ref={orbRef}
        type="button"
        aria-expanded={open}
        aria-label={open ? "Cerrar opciones del asistente" : "Abrir opciones del asistente"}
        title="Arrastra para mover; toca para abrir"
        onClick={onOrbClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => setOrbHovered(true)}
        onMouseLeave={() => setOrbHovered(false)}
        className="group relative flex h-16 w-16 touch-none cursor-grab items-center justify-center rounded-full border border-[#e6d79d]/80 bg-[radial-gradient(circle_at_30%_25%,#fff5bf_0%,#d1b95c_22%,#806b36_55%,#242437_78%)] shadow-[0_0_24px_rgba(200,185,122,0.5)] transition-transform duration-300 hover:scale-110 active:cursor-grabbing active:scale-95 focus:outline-none focus:ring-2 focus:ring-high-enfasis"
      >
        <span className="absolute inset-1 rounded-full border border-white/40 animate-[spin_8s_linear_infinite]" />
        <span className="absolute -inset-2 rounded-full border border-[#c8b97a]/20 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-[#fff5bf]/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Sparkles size={25} className="relative text-[#fff5bf] drop-shadow transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110" />
      </button>
    </div>
  );
}
