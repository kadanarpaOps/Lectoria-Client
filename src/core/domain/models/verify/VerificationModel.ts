export type VerificationType =
  | "VERIFY_REGISTRY"
  | "FORGOT_PASSWORD"
  | "CHANGE_PASSWORD"
  | "CHANGE_EMAIL"
  | "DISABLE_ACCOUNT"
  | "REACTIVATE_ACCOUNT";

export interface VerificationRequest {
  username?: string;
  userEmail?: string;
  optionalUserId?: string;
  verificationType: VerificationType;
  destinationEmail?: string;
}

export interface VerifyCodeRequest extends Omit<VerificationRequest, "destinationEmail"> {
  code: string;
}

export interface VerificationExistence {
  exists: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | null;
  expirationDate: string | null;
}
