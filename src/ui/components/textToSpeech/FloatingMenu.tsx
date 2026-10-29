import { useState } from "react";
import { Play, Pause, Square, Speech, X } from "lucide-react";

type Props = {
  start: () => void,
  pause: () => void,
  stop: () => void,
  speechStatus: string
}

function FloatingMenu({ start, pause, stop, speechStatus }: Props) {
  const [open, setOpen] = useState(false);

  const isPlaying = speechStatus === "started";
  
  return (
    <div className="fixed bottom-6 left-6 flex flex-col items-end">
      {/* Botones desplegables */}
      <div className={`flex flex-col items-end space-y-2 mb-2 transation-all duration-300 ${
          open 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4 pointer-events-none"
        }`}>
        
        {/* Botón Play/Pause Unificado */}
        <button
          onClick={isPlaying ? pause : start}
          className="flex items-center justify-center bg-(--color-primary) text-on-primary w-14 h-14 rounded-full shadow hover:bg-(--color-primary-container) transition"
        >
          {isPlaying ? <Pause className="fill-current"/> : <Play className="fill-current"/> }
        </button>
        {/* Botón Detener */}
        <button
          onClick={stop}
          className="flex items-center justify-center bg-(--color-primary) text-on-primary w-14 h-14 rounded-full shadow hover:bg-(--color-primary-container) transition"
        >
          <Square className="fill-current"/>
        </button>
      </div>
        
      {/* Boton principal */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-500 transform ${
          open 
          ? "bg-gray-800 text-white rotate-360"
          : "bg-(--color-primary) text-on-primary hover:rotate-12"
        }`}
      >
        {open ? <X /> : <Speech className="fill-current"/>}
      </button>
    </div>
  );
}

export default FloatingMenu