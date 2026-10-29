import type {
  VerificationExistence,
  VerificationRequest,
  VerifyCodeRequest,
} from "../../../core/domain/models/verify/VerificationModel";
import httpClient from "../config/axios.instance";

export const createVerificationRequest = async (request: VerificationRequest): Promise<void> => {
  await httpClient.post("verifications", request);
};

export const verifyCodeRequest = async (request: VerifyCodeRequest): Promise<void> => {
  await httpClient.post("verifications/verify", request);
};

export const regenerateVerificationRequest = async (request: VerificationRequest): Promise<void> => {
  await httpClient.patch("verifications/regenerate-code", request);
};

export const getVerificationExistenceRequest = async (
  request: Omit<VerificationRequest, "destinationEmail">,
): Promise<VerificationExistence> => {
  const { verificationType, username, userEmail, optionalUserId } = request;
  const response = await httpClient.get("verifications/verify/verification-existence", {
    params: {
      ...(username ? { username } : {}),
      ...(userEmail ? { email: userEmail } : {}),
      ...(optionalUserId ? { optionalUserId } : {}),
      verificationType,
    },
  });
  return response.data;
};
