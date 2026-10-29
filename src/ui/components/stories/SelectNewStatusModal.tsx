import { useEffect } from "react";
import { StatusIcon } from "./StatusesIcons";

interface Props {
    repeatedStatus: string[];
    onCancel: () => void;
    onSelect: (value: string) => void;
}

const SelectNewStatusModal = ({ repeatedStatus, onCancel, onSelect }: Props) => {

  const statuses = ["IN_PROGRESS", "COMPLETED", "ABANDONED", "PAUSED"];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-black/30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl bg-search-bg rounded-2xl flex-col p-8 h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-fujiWhite tracking-tight">
                  Selecciona un nuevo estado
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                { statuses
                    .filter(s => !repeatedStatus.includes(s))
                    .map(s => (
                      <div key={s} onClick={() => onSelect(s)} className="group relative h-40 rounded-2xl bg-toolbar-bg cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
                        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                          <span className="text-4xl text-high-enfasis">
                            <StatusIcon name={s} size={40} />
                          </span>
                          <span className="text-2xl font-bold text-fujiWhite tracking-tight">
                            {s.replace("_", " ")}
                          </span>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                          <span className="text-9xl">
                            <StatusIcon name={s} size={150} />
                          </span>
                        </div>
                      </div>
                    )
                )}
              </div>
        </div>
        <button onClick={onCancel} className="mt-6 bg-high-enfasis font-bold px-8 py-2 rounded-2xl hover:scale-95 transition-all cursor-pointer text-background-global">
          Cancelar
        </button>
    </div>
  )
}

export default SelectNewStatusModal;
