import z from "zod";
import { statusNames } from "../../../core/domain/models/stories/StoryModel";

export const registerSchema = z.object({
    title: z.string()
        .nonempty("El título no puede estar vacío")
        .min(2, "El título debe tener al menos 2 letras"),
    description: z.string()
        .nonempty("La sinopsis no puede estar vacía")
        .min(20, "La sinopsis es muy corta")
        .max(500, "La sinopsis debe ser de máximo 500 palabras"),
    genreName: z.string()
        .nonempty("Selecciona un género principal"),
    secondaryGenreName: z.string()
        .nonempty("Selecciona un género secundario"),
    tagNames: z.array(z.string()).default([]),
    image: z.instanceof(File).nullable()
        .refine(f => {
            if (!f) return true;
            return ["image/png", "image/jpeg", "image/webp"].includes(f!.type), { message: "Formato no soportado" }
        })
})

export const updateSchema = z.object({
    title: z.string()
        .nonempty("El título no puede estar vacío")
        .min(2, "El título debe tener al menos 2 letras"),
    description: z.string()
        .nonempty("La sinopsis no puede estar vacía")
        .min(20, "La sinopsis es muy corta")
        .max(500, "La sinopsis debe ser de máximo 500 palabras"),
    genreName: z.string()
        .nonempty("Selecciona un género principal"),
    secondaryGenreName: z.string()
        .nonempty("Selecciona un género secundario"),
    status: z.enum(Object.values(statusNames) as [string, ...string[]], {
        error: () => ({ message: "Selecciona un estado válido" })
    }),
})

export const searchSchema = z.object({
    offset: z.number(),
    limit: z.number(),
    title: z.string().nullable().optional(),
    genreName: z.string().nullable().optional(),
    secondaryGenreName: z.string().nullable().optional(),
    status: z.enum([statusNames.IN_PROGRESS, statusNames.COMPLETED, statusNames.ABANDONED, statusNames.PAUSED]).nullable().optional(),
    tagNames: z.array(z.string()).nullable().optional(),
    newestFirst: z.boolean(),
})
