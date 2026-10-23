export const rolesNames = {
    LECTORIA_ADMIN: "LECTORIA_ADMIN",
    LETORIA_LETOR: "LECTORIA_LECTOR",
    LETORIA_WRITER: "LECTORIA_WRITER"
} as const;

export type RolesNames = typeof rolesNames[keyof typeof rolesNames];