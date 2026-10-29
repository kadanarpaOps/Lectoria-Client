import z from "zod";

export const registerSchema = z.object({
    username: z.string()
        .trim()
        .nonempty("Tu Usuario es obligatorio")
        .regex(/^[a-z0-9][a-z0-9._-]{3,29}$/, "Usuario inválido"),
    email: z.string()
        .trim()
        .nonempty("Tu Correo es obligatorio")
        .regex(/^[\w.%+-]+@[A-Za-z\d.-]{2,}\.[a-z]{2,6}$/, "Email inválido"),
    password: z.string()
        .trim()
        .nonempty("To Contraseña es obligatoria")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{7,30}$/,
            "Ingresa una Contraseña entre 7 y 30 carácteres, mínimo 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
        )
})

export const loginSchema = z.object({
    principal: z.string()
        .trim()
        .nonempty("Ingresa tu usuario o correo"),
    password: z.string()
        .nonempty("Ingresa tu contraseña")
})