import z from "zod";
import { statusNames } from "../../../core/domain/models/stories/StoryModel";

// Reglas compartidas entre crear y editar (el backend permite títulos de máximo 120 caracteres)
const titleField = z.string({ error: "El título no puede estar vacío" })
    .trim()
    .nonempty("El título no puede estar vacío")
    .min(2, "El título debe tener al menos 2 letras")
    .max(120, "El título debe tener máximo 120 caracteres");

const descriptionField = z.string({ error: "La sinopsis no puede estar vacía" })
    .trim()
    .nonempty("La sinopsis no puede estar vacía")
    .min(20, "La sinopsis es muy corta")
    .max(500, "La sinopsis debe tener máximo 500 caracteres");

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export const registerSchema = z.object({
    title: titleField,
    description: descriptionField,
    genreName: z.string()
        .nonempty("Selecciona un género principal"),
    secondaryGenreName: z.string()
        .nonempty("Selecciona un género secundario"),
    tagNames: z.array(z.string()).default([]),
    // Antes el mensaje quedaba dentro de la función (operador coma) y nunca se mostraba
    image: z.instanceof(File).nullable()
        .refine(file => !file || ALLOWED_IMAGE_TYPES.includes(file.type), {
            message: "Formato no soportado, usa una imagen JPG, PNG o WEBP",
        })
})

export const updateSchema = z.object({
    title: titleField,
    description: descriptionField,
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
