export const rolesNames = {
    LECTORIA_ADMIN: "LECTORIA_ADMIN",
    LECTORIA_LECTOR: "LECTORIA_LECTOR",
    LECTORIA_WRITER: "LECTORIA_WRITER"
} as const;

export type RolesNames = typeof rolesNames[keyof typeof rolesNames];