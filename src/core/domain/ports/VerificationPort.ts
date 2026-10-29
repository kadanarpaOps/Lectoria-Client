import type {
  VerificationExistence,
  VerificationRequest,
  VerifyCodeRequest,
} from "../models/verify/VerificationModel";

export interface VerificationPort {
  create(request: VerificationRequest): Promise<void>;
  verify(request: VerifyCodeRequest): Promise<void>;
  regenerate(request: VerificationRequest): Promise<void>;
  exists(request: Omit<VerificationRequest, "destinationEmail">): Promise<VerificationExistence>;
}
