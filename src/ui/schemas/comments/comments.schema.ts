import z from "zod";

export const COMMENT_MAX_LENGTH = 5000;

const EMPTY_COMMENT_MESSAGE = "El comentario no puede estar vacío";

// Se usa al crear y al editar: el contenido no puede ser null, undefined, "" ni solo espacios
export const commentSchema = z.object({
    content: z.string({ error: EMPTY_COMMENT_MESSAGE })
        .trim()
        .min(1, EMPTY_COMMENT_MESSAGE)
        .max(COMMENT_MAX_LENGTH, `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres`),
});

export type CommentFormValues = z.infer<typeof commentSchema>;

/**
 * Valida el texto de un comentario con el schema.
 * Devuelve el contenido ya recortado o el primer mensaje de error para mostrarlo debajo del campo.
 */
export const validateComment = (content: string | null | undefined):
    { content: string; error: null } | { content: null; error: string } => {
    const result = commentSchema.safeParse({ content });
    if (result.success) return { content: result.data.content, error: null };
    return { content: null, error: result.error.issues[0]?.message ?? EMPTY_COMMENT_MESSAGE };
};
