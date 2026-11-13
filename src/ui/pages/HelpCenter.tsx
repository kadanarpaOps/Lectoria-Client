import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, CircleHelp, KeyRound, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

const faqItems = [
  {
    question: "¿Cómo encuentro una historia para leer?",
    answer: "Entra en Explorar para buscar por título y filtrar historias por género, subgénero o estado.",
  },
  {
    question: "¿Cómo guardo una historia?",
    answer: "Abre los detalles de una historia y selecciona Guardar. Luego la encontrarás en Mi biblioteca, en la pestaña Historias Guardadas.",
  },
  {
    question: "¿Cómo empiezo a escribir o continúo un capítulo?",
    answer: "Desde tu perfil puedes crear una historia. Para retomar un capítulo que ya estabas editando, usa Escribir; tus historias también aparecen en Mi biblioteca.",
  },
  {
    question: "¿Cómo solicito una coautoría?",
    answer: "Abre los detalles de una historia y selecciona Solicitar coautoría. Puedes consultar el estado desde Solicitudes.",
  },
  {
    question: "¿Cómo recupero mi cuenta o cambio mis datos?",
    answer: "Si olvidaste la contraseña, usa Recuperar acceso. Para cambiar correo o contraseña con la sesión iniciada, ve a Seguridad y sigue la verificación por código.",
  },
];

const quickLinks = [
  { to: "/explore", label: "Explorar historias", icon: BookOpen },
  { to: "/recovery-pass", label: "Recuperar acceso", icon: KeyRound },
  // Agrega aquí tus otras rutas (Mi biblioteca, Solicitudes, Seguridad...)
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems.map((item, index) => ({ ...item, index }));
    return faqItems
      .map((item, index) => ({ ...item, index }))
      .filter(({ question, answer }) => `${question} ${answer}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Cabecera */}
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-toolbar-bg/20 bg-surface-container-low p-6 shadow-lg shadow-black/5 sm:p-10">
        <span
          className="pointer-events-none absolute -right-2 -top-8 select-none text-[11rem] font-extralight leading-none text-high-enfasis/10"
          aria-hidden="true"
        >
          助
        </span>

        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-high-enfasis/25 bg-high-enfasis/10 text-high-enfasis">
            <CircleHelp size={25} aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-high-enfasis">Lectoria</p>
          <h1 className="mt-2 text-3xl font-bold text-global sm:text-4xl">Centro de ayuda</h1>
          <div className="mt-3 h-0.5 w-12 bg-high-enfasis/60" />
          <p className="mt-4 leading-relaxed text-several-light">
            Respuestas rápidas para explorar, leer y escribir historias.
          </p>

          {/* Buscador */}
          <div className="relative mt-6">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-several-light" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca una duda: guardar, coautoría, contraseña..."
              aria-label="Buscar en el centro de ayuda"
              className="w-full rounded-full border border-toolbar-bg/20 bg-background-global py-3 pl-11 pr-4 text-sm text-global placeholder:text-several-light/60 outline-none transition-colors focus:border-high-enfasis focus:ring-2 focus:ring-high-enfasis/30"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)]">
        {/* FAQ */}
        <section aria-labelledby="faq-title" className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="faq-title" className="text-xl font-semibold text-global">Preguntas frecuentes</h2>
            <span className="text-xs text-several-light" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-toolbar-bg/30 p-8 text-center">
              <p className="font-semibold text-global">No encontramos nada con "{query}"</p>
              <p className="mt-2 text-sm text-several-light">Prueba con otra palabra o revisa los accesos rápidos.</p>
            </div>
          )}

          {filtered.map(({ question, answer, index }) => (
            <details
              key={question}
              className="group rounded-2xl border border-toolbar-bg/20 bg-surface-container-low p-5 transition-colors hover:border-high-enfasis/25 open:border-high-enfasis/40 open:bg-surface-container-high sm:p-6"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 font-semibold text-global marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-high-enfasis/30 text-xs font-bold text-high-enfasis transition-colors group-open:bg-high-enfasis group-open:text-on-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{question}</span>
                <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-several-light transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-4 max-w-3xl border-l-2 border-high-enfasis/40 pl-4 text-sm leading-relaxed text-several-light sm:ml-12">
                {answer}
              </p>
            </details>
          ))}
        </section>

        {/* Lateral */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-3xl border border-toolbar-bg/20 bg-surface-container-low p-5 sm:p-6">
            <h2 className="mb-4 font-semibold text-global">Accesos rápidos</h2>
            <div className="space-y-1">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group/link flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm text-several-light transition-colors hover:bg-surface-container-high hover:text-global focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} aria-hidden="true" className="text-high-enfasis" />
                    {label}
                  </span>
                  <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-dashed border-high-enfasis/30 bg-high-enfasis/5 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-high-enfasis">
              <ShieldCheck size={20} aria-hidden="true" />
              <h2 className="font-semibold">Privacidad en esta demo</h2>
            </div>
            <p className="text-sm leading-relaxed text-several-light">
              Lectoria es un proyecto educativo y no una plataforma de producción. Evita ingresar datos personales sensibles o reutilizar contraseñas de otros servicios. Este aviso es informativo, no una política legal formal.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}