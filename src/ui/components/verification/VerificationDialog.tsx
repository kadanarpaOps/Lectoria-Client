import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCw, ShieldCheck } from "lucide-react";
import type {
  VerificationRequest,
  VerificationExistence,
  VerifyCodeRequest,
} from "../../../core/domain/models/verify/VerificationModel";
import { VerificationService } from "../../../core/use-cases/VerificationUseCases";

const verificationService = new VerificationService();

interface VerificationDialogProps {
  request: VerificationRequest;
  title: string;
  description: string;
  onVerified: () => Promise<void>;
  onClose?: () => void;
  createIfMissing?: boolean;
}

export default function VerificationDialog({
  request,
  title,
  description,
  onVerified,
  onClose,
  createIfMissing = true,
}: VerificationDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationReady, setVerificationReady] = useState(false);
  const preparationRef = useRef<{ key: string; promise: Promise<VerificationExistence> } | null>(null);
  const { username, userEmail, optionalUserId, verificationType, destinationEmail } = request;

  useEffect(() => {
    let active = true;
    const identity = { username, userEmail, optionalUserId, verificationType };
    const verificationRequest: VerificationRequest = {
      ...identity,
      destinationEmail,
    };
    const key = JSON.stringify(verificationRequest);
    if (!preparationRef.current || preparationRef.current.key !== key) {
      const promise = verificationService.exists(identity).then(async (current) => {
        if (current.exists || !createIfMissing) return current;
        await verificationService.create(verificationRequest);
        return { exists: true, verificationStatus: "PENDING" as const, expirationDate: null };
      });
      preparationRef.current = { key, promise };
    }
    const preparation = preparationRef.current.promise;
    void preparation.then((current) => {
      if (!active) return;
      setCodeVerified(current.verificationStatus === "VERIFIED");
      setVerificationReady(current.exists);
      setMessage(current.exists
        ? null
        : "No se encontró una verificación. Comprueba que el registro se haya creado correctamente.");
    }).catch(() => {
      if (active) setMessage("No se pudo preparar la verificación. Intenta nuevamente.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [createIfMissing, destinationEmail, optionalUserId, userEmail, username, verificationType]);

  const regenerate = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await verificationService.regenerate(request);
      setCodeVerified(false);
      setVerificationReady(true);
      setCode("");
      setMessage("Enviamos un nuevo código de verificación.");
    } catch {
      setMessage("No se pudo reenviar el código. Comprueba los datos e inténtalo otra vez.");
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const verifyRequest: VerifyCodeRequest = {
      username: request.username,
      userEmail: request.userEmail,
      optionalUserId: request.optionalUserId,
      verificationType: request.verificationType,
      code: code.trim(),
    };
    let verified = codeVerified;
    try {
      if (!verified) {
        await verificationService.verify(verifyRequest);
        verified = true;
        setCodeVerified(true);
      }
      await onVerified();
    } catch {
      setMessage(verified
        ? "El código se confirmó, pero no se pudo completar la operación. Vuelve a intentarlo."
        : "El código no es válido o ha caducado. Verifica e inténtalo otra vez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-3xl border border-toolbar-bg/10 bg-background-global p-7 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-high-enfasis/10 text-high-enfasis">
              <ShieldCheck size={25} />
            </div>
            <h2 className="text-2xl font-bold text-global">{title}</h2>
            <p className="mt-2 leading-relaxed text-several-light">{description}</p>
            {destinationEmail && (
              <p className="mt-2 break-all text-sm font-medium text-high-enfasis">
                {destinationEmail}
              </p>
            )}
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Volver" className="text-several-light hover:text-global">
              <ArrowLeft size={20} />
            </button>
          )}
        </div>

        <form onSubmit={verify} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-several-light">
            Código de un solo uso
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              required={!codeVerified}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-xl bg-inputs-bg px-5 py-4 text-global outline-none focus:ring-2 focus:ring-high-enfasis"
              placeholder="Escribe el código recibido"
            />
          </label>
          {message && <p role="status" className="text-sm text-red-400">{message}</p>}
          <button
            type="submit"
            disabled={loading || submitting || !verificationReady || (!codeVerified && code.trim().length === 0)}
            className="w-full rounded-full bg-high-enfasis py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Preparando verificación..." : submitting ? "Verificando..." : codeVerified ? "Completar operación" : "Verificar código"}
          </button>
          {!codeVerified && (
            <button
              type="button"
              onClick={regenerate}
              disabled={loading || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-toolbar-bg/15 py-3 font-semibold text-global disabled:opacity-50"
            >
              <RotateCw size={16} /> Reenviar código
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
