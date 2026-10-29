export const typeAlert = {
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const;

export type TypeAlert = typeof typeAlert[keyof typeof typeAlert];
