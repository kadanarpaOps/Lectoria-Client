import { useEffect, useRef, useState, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft, RotateCw, ShieldCheck } from "lucide-react";
import type {
  VerificationRequest,
  VerificationExistence,
  VerificationType,
  VerifyCodeRequest,
} from "../../../core/domain/models/verify/VerificationModel";
import { VerificationService } from "../../../core/use-cases/VerificationUseCases";
import VerificationBreadcrumbs from "./VerificationBreadcrumbs";

const verificationService = new VerificationService();

const verificationSteps: Record<VerificationType, string[]> = {
  VERIFY_REGISTRY: ["Código"],
  FORGOT_PASSWORD: ["Identificación", "Código", "Nueva contraseña"],
  CHANGE_PASSWORD: ["Código", "Nueva contraseña"],
  CHANGE_EMAIL: ["Nuevo correo", "Código", "Confirmación"],
  DISABLE_ACCOUNT: ["Código"],
  REACTIVATE_ACCOUNT: ["Identidad", "Código", "Nueva contraseña"],
};

interface VerificationDialogProps {
  request: VerificationRequest;
  title: string;
  description: string;
  onVerified: () => Promise<void>;
  onClose?: () => void;
  createIfMissing?: boolean;
  completeWhenVerified?: boolean;
  embedded?: boolean;
  maxRegenerations?: number;
  notFoundMessage?: string;
  replaceIfDestinationMismatch?: boolean;
  stepLabels?: string[];
  verifiedContent?: (submitting: boolean) => ReactNode;
}

function toTimestamp(value: string | null, epoch?: number | null): number | null {
  if (epoch != null) return epoch;
  if (!value) return null;
  const timestamp = Date.parse(value.replace(" ", "T"));
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatRemaining(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function failureMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}

function applyExistence(
  current: VerificationExistence,
  setVerificationReady: (ready: boolean) => void,
  setVerificationExpiresAt: (timestamp: number | null) => void,
  setCodeExpiresAt: (timestamp: number | null) => void,
): void {
  setVerificationReady(current.exists);
  setVerificationExpiresAt(toTimestamp(current.expirationDate, current.expirationEpochMillis));
  setCodeExpiresAt(toTimestamp(current.codeExpirationDate, current.codeExpirationEpochMillis));
}

export default function VerificationDialog({
  request,
  title,
  description,
  onVerified,
  onClose,
  createIfMissing = true,
  completeWhenVerified = false,
  embedded = false,
  maxRegenerations,
  notFoundMessage = "No se encontró una verificación activa para estos datos.",
  replaceIfDestinationMismatch = false,
  stepLabels,
  verifiedContent,
}: VerificationDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationReady, setVerificationReady] = useState(false);
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<number | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [serverResendLimitReached, setServerResendLimitReached] = useState(false);
  const preparationRef = useRef<{ key: string; promise: Promise<VerificationExistence> } | null>(null);
  const autoCompletionRef = useRef(false);
  const completionInProgressRef = useRef(false);
  const verificationInProgressRef = useRef(false);
  const onVerifiedRef = useRef(onVerified);
  const verifiedContentRef = useRef(verifiedContent);
  const { username, userEmail, optionalUserId, verificationType, destinationEmail } = request;

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    verifiedContentRef.current = verifiedContent;
  }, [verifiedContent]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const completeOperation = async () => {
    if (completionInProgressRef.current) return;
    completionInProgressRef.current = true;
    setSubmitting(true);
    setMessage(null);
    try {
      await onVerifiedRef.current();
    } catch (error) {
      setMessage(failureMessage(error, "La verificación se confirmó, pero no se pudo completar la operación. Inténtalo otra vez."));
    } finally {
      completionInProgressRef.current = false;
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let active = true;
    const identity = { username, userEmail, optionalUserId, verificationType };
    const verificationRequest: VerificationRequest = { ...identity, destinationEmail };
    const key = JSON.stringify(verificationRequest);

    if (!preparationRef.current || preparationRef.current.key !== key) {
      const promise = verificationService.exists(identity).then(async (current) => {
        const destinationChanged = current.exists
          && replaceIfDestinationMismatch
          && current.destinationEmail !== destinationEmail;
        if (current.exists && !destinationChanged) return current;
        if (!current.exists && !createIfMissing) return current;
        await verificationService.create(verificationRequest);
        return verificationService.exists(identity);
      });
      preparationRef.current = { key, promise };
    }

    void preparationRef.current.promise
      .then((current) => {
        if (!active) return;
        setCodeVerified(current.verificationStatus === "VERIFIED");
        applyExistence(current, setVerificationReady, setVerificationExpiresAt, setCodeExpiresAt);
        setServerResendLimitReached(current.resendLimitReached ?? false);
        setMessage(current.exists ? null : notFoundMessage);
        if (current.verificationStatus === "VERIFIED" && completeWhenVerified && !verifiedContentRef.current
          && !autoCompletionRef.current) {
          autoCompletionRef.current = true;
          void completeOperation();
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage(failureMessage(error, "No se pudo preparar la verificación. Comprueba los datos e inténtalo nuevamente."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    completeWhenVerified,
    createIfMissing,
    destinationEmail,
    notFoundMessage,
    optionalUserId,
    replaceIfDestinationMismatch,
    userEmail,
    username,
    verificationType,
  ]);

  const regenerate = async () => {
    if (submitting || loading || (maxRegenerations != null && regenerationCount >= maxRegenerations)
      || now == null
      || (codeExpiresAt != null && codeExpiresAt > now)) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await verificationService.regenerate(request);
      const current = await verificationService.exists({
        username,
        userEmail,
        optionalUserId,
        verificationType,
      });
      applyExistence(current, setVerificationReady, setVerificationExpiresAt, setCodeExpiresAt);
      setCodeVerified(current.verificationStatus === "VERIFIED");
      setServerResendLimitReached(current.resendLimitReached ?? false);
      setRegenerationCount((count) => count + 1);
      setCode("");
      setMessage("Enviamos un nuevo código de verificación.");
    } catch (error) {
      setMessage(failureMessage(error, "No se pudo reenviar el código. Espera a que termine el contador e inténtalo otra vez."));
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (verificationInProgressRef.current) return;
    verificationInProgressRef.current = true;
    setSubmitting(true);
    setMessage(null);
    let verified = codeVerified;
    try {
      if (!verified) {
        const verifyRequest: VerifyCodeRequest = {
          username,
          userEmail,
          optionalUserId,
          verificationType,
          code: code.trim(),
        };
        await verificationService.verify(verifyRequest);
        verified = true;
        setCodeVerified(true);
      }
      if (!verifiedContent) await onVerifiedRef.current();
    } catch (error) {
      setMessage(failureMessage(error, verified
        ? "La verificación se confirmó, pero no se pudo completar la operación. Vuelve a intentarlo."
        : "El código no es válido o ha caducado. Verifícalo e inténtalo otra vez."));
    } finally {
      verificationInProgressRef.current = false;
      setSubmitting(false);
    }
  };

  const remainingVerification = verificationExpiresAt == null
    ? null
    : now == null ? null : Math.max(0, verificationExpiresAt - now);
  const remainingCode = codeExpiresAt == null || now == null ? 0 : Math.max(0, codeExpiresAt - now);
  const verificationExpired = remainingVerification === 0;
  const resendLimitReached = serverResendLimitReached
    || (maxRegenerations != null && regenerationCount >= maxRegenerations);
  const steps = stepLabels ?? verificationSteps[verificationType];
  const activeStep = codeVerified && verifiedContent
    ? steps.length - 1
    : stepLabels || verificationType === "FORGOT_PASSWORD" || verificationType === "CHANGE_EMAIL"
      ? 1
      : 0;

  const content = (
    <>
        <div className="relative mb-6 flex flex-col items-center text-center">
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Volver" className="absolute right-0 top-0 cursor-pointer rounded-full p-2 text-several-light transition-all duration-200 hover:scale-110 hover:bg-high-enfasis/10 hover:text-global active:scale-90">
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-high-enfasis/10 text-high-enfasis">
            <ShieldCheck size={25} />
          </div>
          <h2 className="text-2xl font-bold text-global">{title}</h2>
          <p className="mt-2 max-w-xl leading-relaxed text-several-light">{description}</p>
          {destinationEmail && (
            <p className="mt-2 break-all text-sm font-medium text-high-enfasis">
              Código enviado a {destinationEmail}
            </p>
          )}
        </div>

        <VerificationBreadcrumbs steps={steps} activeStep={activeStep} />

        <div className="mx-auto w-full max-w-lg">
        {loading ? (
          <p role="status" className="text-center text-several-light">Preparando verificación...</p>
        ) : verificationReady && !verificationExpired && codeVerified && verifiedContent ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void completeOperation();
            }}
          >
            {remainingVerification != null && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-several-light">Tiempo restante para completar la verificación</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-global">{formatRemaining(remainingVerification)}</p>
              </div>
            )}
            {verifiedContent(submitting)}
          </form>
        ) : verificationReady && !verificationExpired && !codeVerified ? (
          <>
            {remainingVerification != null && (
              <div className="mb-5 rounded-2xl border border-high-enfasis/20 bg-high-enfasis/10 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-several-light">Tiempo restante para completar la verificación</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-global">
                  {formatRemaining(remainingVerification)}
                </p>
              </div>
            )}
            <form onSubmit={verify} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
                Código de un solo uso
                <input
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-2 w-full rounded-xl bg-inputs-bg px-5 py-4 text-global outline-none focus:ring-2 focus:ring-high-enfasis"
                  placeholder="Escribe el código recibido"
                />
              </label>
              <button
                type="submit"
                disabled={submitting || !verificationReady || code.length !== 6}
                className="w-full cursor-pointer rounded-full bg-high-enfasis py-3.5 font-semibold text-on-primary-fixed shadow-lg shadow-high-enfasis/20 transition-all duration-300 hover:scale-[0.98] hover:bg-high-enfasis/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? "Verificando..." : "Verificar código"}
              </button>
            </form>
            <div className="mt-4">
              <button
                type="button"
                onClick={regenerate}
                disabled={submitting || now == null || remainingCode > 0 || resendLimitReached}
                className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-toolbar-bg/15 py-3 font-semibold text-global transition-all duration-300 hover:scale-[0.98] hover:border-high-enfasis/40 hover:bg-high-enfasis/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <RotateCw size={16} className="transition-transform duration-300 group-hover:rotate-180" />
                {resendLimitReached
                  ? "Ya utilizaste el reenvío disponible"
                  : submitting
                    ? "Enviando..."
                    : remainingCode > 0
                      ? `Reenviar código (${formatRemaining(remainingCode)})`
                      : "Reenviar código"}
              </button>
            </div>
          </>
        ) : verificationReady && !verificationExpired && codeVerified ? (
          <form onSubmit={verify} className="space-y-4">
            {remainingVerification != null && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-several-light">Tiempo restante para completar la verificación</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-global">{formatRemaining(remainingVerification)}</p>
              </div>
            )}
            <p className="text-center text-emerald-300">El código ya fue verificado.</p>
            <button
              type="submit"
              disabled={submitting || verificationExpired}
              className="w-full cursor-pointer rounded-full bg-high-enfasis py-3.5 font-semibold text-on-primary-fixed shadow-lg shadow-high-enfasis/20 transition-all duration-300 hover:scale-[0.98] hover:bg-high-enfasis/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? "Procesando..." : "Completar operación"}
            </button>
          </form>
        ) : (
          <p role="status" className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
            {verificationReady && verificationExpired
              ? "La verificación ha caducado. Inicia el proceso nuevamente."
              : message ?? notFoundMessage}
          </p>
        )}

        {message && verificationReady && <p role="status" className="mt-4 text-sm text-red-300">{message}</p>}
        </div>
    </>
  );

  return embedded
    ? <section className="flex min-h-[min(34rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col justify-center overflow-y-auto rounded-3xl border border-toolbar-bg/10 bg-background-global p-5 shadow-2xl sm:p-8 lg:p-10">{content}</section>
    : (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6">
        <section className="my-auto w-full max-w-2xl rounded-3xl border border-toolbar-bg/10 bg-background-global p-5 shadow-2xl sm:p-8 lg:p-10">{content}</section>
      </div>
    );
}
