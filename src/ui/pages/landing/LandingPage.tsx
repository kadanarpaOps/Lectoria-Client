import { BookOpen, PenLine, Users } from 'lucide-react';
import { Globe, Rss, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';


// ─── Navbar Landing (versión visitante) ──────────────────────────────────────
function LandingNavbar() {

    // Use Navigate
    const navigate = useNavigate();

    // Use AUth
    const authUser = null;

    return (
        <header className="sticky top-0 z-40 w-full bg-[#c8b97a] shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-[1fr_auto] justify-between items-center gap-2 px-3 sm:px-8 h-14">
                {/* Izquierda — Logo */}
                <div className="flex items-center gap-3">
                    <img src="/lectoria-favicon.svg" alt="Lectoria" className="w-7 h-7 opacity-80" />
                    <span className="text-[#1a2030] font-bold text-sm sm:text-lg tracking-widest uppercase">Lectoria</span>
                </div>

                {/* Centro — Búsqueda */}
                {/**<div className="flex justify-center">
                    <div className="flex items-center relative">
                        <svg className="absolute left-3 text-[#1a2030]/50 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar historias..."
                            className="bg-white/35 border-none rounded-full py-1.5 pl-9 pr-5 text-sm text-[#1a2030] placeholder-[#1a2030]/50 focus:outline-none focus:ring-2 focus:ring-[#1a2030]/20 w-64 transition-all focus:bg-white/50"
                        />
                    </div>
                </div>*/}

                {/* Derecha — CTAs */}
                <div className="flex items-center justify-end gap-1 sm:gap-3">
                    { authUser ? (
                        <button
                            onClick={() => navigate('/profile')}
                            className="bg-[#1a2030] text-[#c8b97a] text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-[#1a2030]/80 transition-colors cursor-pointer"
                        >
                            Volver a Lectoria
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/auth')}
                                className="text-[#1a2030] text-xs sm:text-sm font-medium px-2 sm:px-4 py-1.5 rounded-full border border-[#1a2030]/30 hover:bg-[#1a2030]/10 transition-colors cursor-pointer"
                            >
                                Iniciar sesión
                            </button>
                            <button
                                onClick={() => navigate('/auth', { state: { authAction: "REGISTER" }})}
                                className="bg-[#1a2030] text-[#c8b97a] text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 rounded-full hover:bg-[#1a2030]/80 transition-colors cursor-pointer"
                            >
                                Registrarse
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
    const navigate = useNavigate();
    return (
        <section className="relative min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden bg-[url('/images/hero-bg.webp')] bg-cover bg-position-[center_top] bg-no-repeat bg-[#1a1a24]">
            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-[#14141e]/65 via-[#14141e]/45 to-[#14141e]/80 z-10" />

            {/* Kana Left */}
            <div className="absolute inset-y-0 left-0 z-20 flex flex-col items-start justify-center px-[1.5vw] gap-1 pointer-events-none select-none" aria-hidden="true">
                <span className="text-[clamp(4rem,8vw,9rem)] font-extralight text-[#c8b97a]/20 leading-none tracking-tighter animate-kana-float">デ</span>
                <span className="text-[clamp(3.5rem,7vw,8rem)] font-extralight text-[#c8b97a]/20 leading-none tracking-tighter animate-kana-float [animation-delay:1s]">イ</span>
                <div className="w-[clamp(70px,11vw,140px)] h-[clamp(90px,15vw,180px)] my-3 bg-[#c8b97a]/10 border-[1.5px] border-[#c8b97a]/20 kana-drop-shape -rotate-15 flex items-center justify-center after:content-['ジ'] after:text-[clamp(2rem,5vw,4.5rem)] after:text-[#c8b97a]/30 after:rotate-15" />
                <span className="text-[clamp(3rem,6vw,7rem)] opacity-70 font-extralight text-[#c8b97a]/20 leading-none tracking-tighter animate-kana-float [animation-delay:2s]">ジ</span>
                <span className="block w-[clamp(50px,9vw,120px)] h-0.5 bg-[#c8b97a]/25 mt-2" />
            </div>

            {/* Hero Content */}
            <div className="relative z-30 text-center max-w-145 px-8 flex flex-col items-center gap-5 mt-[-6vh] animate-hero-fade">
                <p className="text-[clamp(1.2rem,2.5vw,1.6rem)] font-light text-[#7ab3c8] tracking-widest">Bienvenido</p>
                <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold text-[#e8e0d0] tracking-[0.12em] uppercase leading-[1.05] drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                    A TU TINTA
                </h1>
                <div className="max-w-115 text-left flex flex-col gap-4 mt-2">
                    <p className="text-[clamp(0.8rem,1.4vw,0.95rem)] text-[#9a9080] leading-relaxed font-light">
                        Descubre historias que te atraparán desde la primera página. Lee, escribe y comparte
                        narrativas únicas creadas por una comunidad apasionada de escritores y lectores.
                    </p>
                    <p className="text-[clamp(0.8rem,1.4vw,0.95rem)] text-[#9a9080] leading-relaxed font-light">
                        Desde romance hasta fantasía épica, encuentra tu próxima historia favorita
                        o comparte la tuya con el mundo. Tu tinta, tu historia, tu comunidad.
                    </p>
                </div>
                {/* CTA hero */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
                    <button
                        onClick={() => navigate('/auth')}
                        className="bg-[#c8b97a] text-[#1a1a24] font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 rounded-full hover:bg-[#d4c98a] transition-colors cursor-pointer tracking-wide"
                    >
                        Comenzar a leer
                    </button>
                    <button
                        onClick={() => navigate('/auth')}
                        className="border border-[#c8b97a]/40 text-[#c8b97a] font-medium text-xs sm:text-sm px-5 sm:px-7 py-2.5 rounded-full hover:bg-[#c8b97a]/10 transition-colors cursor-pointer tracking-wide"
                    >
                        Publicar historia
                    </button>
                </div>
            </div>

            {/* Kana Right */}
            <div className="absolute inset-y-0 right-0 z-20 flex flex-col items-end justify-center px-[1.5vw] gap-1 pointer-events-none select-none" aria-hidden="true">
                <span className="text-[clamp(4rem,8vw,9rem)] font-extralight text-[#c8b97a]/20 leading-none tracking-tighter animate-kana-float">イ</span>
                <span className="text-[clamp(3.5rem,7vw,8rem)] font-extralight text-[#c8b97a]/20 leading-none tracking-tighter animate-kana-float [animation-delay:1s]">ン</span>
                <div className="w-[clamp(100px,16vw,210px)] h-[clamp(100px,16vw,210px)] mt-4 bg-[#c8b97a]/08 border-[1.5px] border-[#c8b97a]/15 animate-blob-morph" />
            </div>

            {/* Geo Squares */}
            <div className="absolute bottom-[8%] right-[8%] z-20 pointer-events-none" aria-hidden="true">
                <div className="absolute border-[1.5px] border-[#c8b97a]/35 w-30 h-30 top-0 right-0 animate-geo-rotate" />
                <div className="absolute border-[1.5px] border-[#c8b97a]/35 w-20 h-20 top-7.5 right-7.5 animate-geo-rotate-reverse" />
                <div className="absolute border-[1.5px] border-[#c8b97a]/20 w-11 h-11 top-[3.4rem] right-[3.4rem]" />
            </div>

            <div className="absolute bottom-[20%] right-[22%] z-20 text-[#c8b97a]/40 text-xl animate-sparkle-pulse" aria-hidden="true">✦</div>
            <div className="absolute bottom-[35%] right-[6%] z-20 text-[#c8b97a]/40 text-[0.8rem] animate-sparkle-pulse [animation-delay:1.5s]" aria-hidden="true">✦</div>
        </section>
    );
}

// ─── Qué puedes hacer ─────────────────────────────────────────────────────────
interface FeaturePillProps {
    icon: ReactNode;
    title: string;
    description: string;
    kana: string;
}

function FeatureCard({ icon, title, description, kana }: FeaturePillProps) {
    return (
        <div className="relative flex flex-col gap-5 p-8 bg-[#1e1e2a] border border-[#c8b97a]/12 rounded-sm overflow-hidden group hover:border-[#c8b97a]/30 transition-colors duration-300">
            {/* Kana decorativo de fondo */}
            <span className="absolute -bottom-4 -right-2 text-[7rem] font-extralight text-[#c8b97a]/05 leading-none pointer-events-none select-none group-hover:text-[#c8b97a]/08 transition-colors duration-300">
                {kana}
            </span>
            {/* Ícono */}
            <div className="w-11 h-11 flex items-center justify-center border border-[#c8b97a]/25 text-[#c8b97a]">
                {icon}
            </div>
            <div className="flex flex-col gap-2 relative z-10">
                <h3 className="text-[#e8e0d0] font-semibold text-lg tracking-wide">{title}</h3>
                <p className="text-[#9a9080] text-sm leading-relaxed font-light">{description}</p>
            </div>
            {/* Línea dorada inferior */}
            <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#c8b97a]/50 group-hover:w-full transition-all duration-500" />
        </div>
    );
}

function FeaturesSection() {
    const features: FeaturePillProps[] = [
        {
            icon: <BookOpen size={22} />,
            title: 'Lee',
            kana: '読',
            description: 'Explora miles de historias de todos los géneros. Romance, fantasía, terror, ciencia ficción — hay un universo esperándote en cada página.',
        },
        {
            icon: <PenLine size={22} />,
            title: 'Escribe',
            kana: '書',
            description: 'Crea y publica tus propias historias con un editor pensado para escritores. Capítulos, portadas, géneros — todo en un solo lugar.',
        },
        {
            icon: <Users size={22} />,
            title: 'Conecta',
            kana: '繋',
            description: 'Sigue a tus autores favoritos, comenta, deja reseñas y forma parte de una comunidad que vive para las historias.',
        },
    ];

    return (
        <section className="bg-[#13131a] py-24 px-8">
            <div className="max-w-275 mx-auto flex flex-col gap-14">
                {/* Header */}
                <div className="text-center flex flex-col gap-3">
                    <span className="text-[#c8b97a]/60 text-xs tracking-[0.3em] uppercase font-light">¿Qué puedes hacer?</span>
                    <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-light text-[#e8e0d0] tracking-wide">
                        Todo lo que un amante de las historias necesita
                    </h2>
                    <div className="w-12 h-px bg-[#c8b97a]/40 mx-auto mt-1" />
                </div>
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <FeatureCard key={f.title} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Historias Destacadas ─────────────────────────────────────────────────────
interface BookCardProps {
    title: string;
    author: string;
    genre: string;
    coverColor: string;
    coverUrl?: string;
}

export function BookCard({ title, author, genre, coverColor, coverUrl }: BookCardProps) {
    return (
        <div className="flex flex-col gap-3 cursor-pointer group transition-transform hover:-translate-y-1.5">
            <div className="relative w-full aspect-3/4 rounded-sm overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-shadow" style={{ background: coverColor }}>
                { coverUrl && (
                    <img
                        src={`${coverUrl}`}
                        alt="Portada de Historia"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex items-end p-3">
                    <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-[#d4c98a] bg-black/40 border border-[#c8b97a]/40 px-2 py-0.5 rounded-full">
                        {genre}
                    </span>
                </div>
                <div className="book-spine-effect" />
                <div className="absolute w-2 h-2 rounded-full bg-[#c8b97a]/60 top-2 left-3" />
                <div className="absolute w-2 h-2 rounded-full bg-[#c8b97a]/60 bottom-2 right-2" />
            </div>
            <div className="px-1">
                <h3 className="text-[0.82rem] font-semibold text-[#e8e0d0] leading-tight truncate mb-0.5">{title}</h3>
                <p className="text-[0.72rem] text-[#6a6458] font-light">{author}</p>
            </div>
        </div>
    );
}

const FEATURED_BOOKS: BookCardProps[] = [
    { title: 'Ecos del Abismo',      author: 'Valeria Montoya', genre: 'Fantasía',       coverColor: 'linear-gradient(135deg, #2c1810, #8b4513)' },
    { title: 'Cartas al Viento',     author: 'Santiago Reyes',  genre: 'Romance',         coverColor: 'linear-gradient(135deg, #1a1a2e, #0f3460)' },
    { title: 'La Última Madrugada', author: 'Camila Torres',   genre: 'Drama',           coverColor: 'linear-gradient(135deg, #0d1b2a, #2d3a4a)' },
    { title: 'Sombras de Papel',     author: 'Andrés Ruiz',     genre: 'Misterio',        coverColor: 'linear-gradient(135deg, #1c0a2e, #4a1a8a)' },
    { title: 'Entre Mundos',         author: 'Laura Pérez',     genre: 'Sci-Fi',          coverColor: 'linear-gradient(135deg, #0a1628, #103a5e)' },
    { title: 'Flor de Ceniza',       author: 'Daniel Mora',     genre: 'Fantasía Oscura', coverColor: 'linear-gradient(135deg, #1a0a0a, #6b2020)' },
];

function FeaturedSection() {
    return (
        <section className="bg-background-global py-14 sm:py-20 px-4 sm:px-8">
            <div className="max-w-275 mx-auto">
                <div className="text-center flex flex-col gap-3 mb-14">
                    <span className="text-[#c8b97a]/60 text-xs tracking-[0.3em] uppercase font-light">Destacado</span>
                    <h2 className="text-[clamp(1.3rem,3vw,2rem)] font-light text-[#e8e0d0] tracking-wide">
                        Historias que no puedes perderte
                    </h2>
                    <div className="w-12 h-px bg-[#c8b97a]/40 mx-auto mt-1" />
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-6 gap-y-8 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))]">
                    {FEATURED_BOOKS.map((book) => (
                        <BookCard key={book.title} {...book} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Sobre Nosotros ───────────────────────────────────────────────────────────
function AboutSection() {
    return (
        <section className="bg-[#13131a] py-16 sm:py-24 px-4 sm:px-8 overflow-hidden">
            <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* Izquierda — Texto */}
                <div className="flex flex-col gap-7">
                    <div className="flex flex-col gap-3">
                        <span className="text-[#c8b97a]/60 text-xs tracking-[0.3em] uppercase font-light">Sobre nosotros</span>
                        <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-light text-[#e8e0d0] tracking-wide leading-snug">
                            Nacimos del amor<br />por las historias
                        </h2>
                        <div className="w-12 h-px bg-[#c8b97a]/40 mt-1" />
                    </div>

                    <div className="flex flex-col gap-5 text-[#9a9080] text-sm leading-relaxed font-light">
                        <p>
                            Lectoria nació con una idea simple: que cualquier persona, sin importar dónde esté,
                            pueda encontrar su próxima historia favorita o compartir la que lleva dentro.
                        </p>
                        <p>
                            Somos una plataforma construida por y para amantes de la narrativa. Creemos que
                            las historias tienen el poder de conectar mundos, y que cada escritor merece
                            un espacio digno para su voz.
                        </p>
                        <p>
                            Desde Colombia para el mundo — <span className="text-[#c8b97a]/80 italic">tu tinta nunca miente.</span>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        {[
                            { value: '10K+', label: 'Historias' },
                            { value: '5K+',  label: 'Escritores' },
                            { value: '50K+', label: 'Lectores' },
                        ].map(({ value, label }) => (
                            <div key={label} className="flex flex-col gap-1 border-l border-[#c8b97a]/20 pl-4">
                                <span className="text-[#c8b97a] text-2xl font-semibold tracking-wide">{value}</span>
                                <span className="text-[#9a9080] text-xs uppercase tracking-widest font-light">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Derecha — Decorativo */}
                <div className="relative flex items-center justify-center h-80 md:h-auto select-none pointer-events-none" aria-hidden="true">
                    {/* Círculo exterior */}
                    <div className="absolute w-64 h-64 rounded-full border border-[#c8b97a]/10" />
                    <div className="absolute w-48 h-48 rounded-full border border-[#c8b97a]/08" />
                    {/* Gota central */}
                    <div className="relative w-36 h-44 bg-[#c8b97a]/08 border border-[#c8b97a]/20 kana-drop-shape flex items-center justify-center">
                        <span className="text-5xl font-extralight text-[#c8b97a]/40">墨</span>
                    </div>
                    {/* Katakana flotantes */}
                    <span className="absolute top-6 left-8 text-5xl font-extralight text-[#c8b97a]/15 animate-kana-float">イ</span>
                    <span className="absolute bottom-8 right-10 text-4xl font-extralight text-[#c8b97a]/12 animate-kana-float [animation-delay:1.5s]">ン</span>
                    <span className="absolute top-12 right-6 text-3xl font-extralight text-[#c8b97a]/10 animate-kana-float [animation-delay:0.7s]">ク</span>
                    {/* Sparkles */}
                    <span className="absolute top-4 right-16 text-[#c8b97a]/30 animate-sparkle-pulse">✦</span>
                    <span className="absolute bottom-6 left-12 text-[#c8b97a]/20 text-xs animate-sparkle-pulse [animation-delay:1s]">✦</span>
                </div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="bg-surface-container-lowest py-8 sm:py-10 px-4 sm:px-8 border-t border-[#c8b97a]/08">
            <div className="max-w-275 mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <img src="/lectoria-favicon.svg" alt="Lectoria" className="w-5 h-5 opacity-50" />
                    <span className="text-[#9a9080] text-sm tracking-widest uppercase font-light">Lectoria</span>
                </div>
                <p className="text-[#6a6458] text-xs tracking-wide font-light">
                    Tu tinta, tu historia, tu comunidad — © {new Date().getFullYear()}
                </p>
                <div className="flex items-center gap-5 text-[#6a6458]">
                    <a href="#"><Globe size={16} /></a>
                    <a href="#"><Rss size={16} /></a>
                    <a href="#"><Mail size={16} /></a>
                </div>

            </div>
        </footer>
    );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background-global text-[#e8e0d0] font-['Poppins'] overflow-x-hidden">
            <LandingNavbar />
            <main>
                <Hero />
                <FeaturesSection />
                <FeaturedSection />
                <AboutSection />
            </main>
            <Footer />
        </div>
    );
}