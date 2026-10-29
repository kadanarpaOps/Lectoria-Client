import {
  createVerificationRequest,
  getVerificationExistenceRequest,
  regenerateVerificationRequest,
  verifyCodeRequest,
} from "../../infrastructure/api/requests/verifications.request";
import type { VerificationPort } from "../domain/ports/VerificationPort";
import type {
  VerificationExistence,
  VerificationRequest,
  VerifyCodeRequest,
} from "../domain/models/verify/VerificationModel";

export class VerificationService implements VerificationPort {
  async create(request: VerificationRequest): Promise<void> {
    await createVerificationRequest(request);
  }

  async verify(request: VerifyCodeRequest): Promise<void> {
    await verifyCodeRequest(request);
  }

  async regenerate(request: VerificationRequest): Promise<void> {
    await regenerateVerificationRequest(request);
  }

  async exists(request: Omit<VerificationRequest, "destinationEmail">): Promise<VerificationExistence> {
    return getVerificationExistenceRequest(request);
  }
}
