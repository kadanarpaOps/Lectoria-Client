
const RegisterLeftPanel = () => {
  return (
    <>
        <div className="z-20">
            <h1 className="text-3xl font-semibold tracking-tighter text-global">
                Lectoria
            </h1>
            <p className="text-several-light text-xs mt-2 font-light tracking-wide italic">
                Tu Biblioteca Personal
            </p>
        </div>
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-lighten">
            <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByGtMXMwNVspExMucd13SO2nJ5VQW3I_E3wpcZyxoe4UrO_tlv9nyJ5KL-N7sL_SryirVa5EYPBUC-XnZ48Q5L5SASLRKvF0J8lOXvxvT5MNf6T1MJswE9PAeNwU9nA3HQYtWhC0jKNa5wA2KfoLiY63JVWmgVTSmPfEye9PQlkozt5IzJPJIW0l9d5glSLFlZtbL0BGpY9NPUmbYaD3b2WFexe_7ndFdz189_GHrNW9oK2z9Bd3mNMSYwj7l6Hi_0vVLCgdoI9Xo"
            alt="Artistic moody composition of antique book pages and ink stains"
            className="w-full h-full object-cover"
            />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-background-global via-transparent to-background-global/50 z-10"></div>
        <div className="absolute inset-0 bg-linear-to-r from-transparent to-background-global z-10"></div>
        <div className="mt-auto z-20 max-w-xs">
            <p className="text-2xl font-light text-global/80 leading-relaxed italic">
                "Toda gran historia comienza con un trazo de tinta bajo la luna."
            </p>
            <div className="h-1 w-12 bg-high-enfasis mt-6"></div>
        </div>
    </>
  )
}

export default RegisterLeftPanel
