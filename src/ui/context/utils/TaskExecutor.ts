import { isAxiosError } from "axios";
import { typeAlert } from "../AlertTypes";

const executeTask = async <T,>(
    task: () => Promise<T>,
    setLoading: (loading: boolean) => void,
    setServerError: (error: string | null) => void,
    showAlert?: (message: string, duration?: number, type?: string) => void,
    needAlert: boolean = false
): Promise<T | null> => {
    setLoading(true);
    setServerError(null);
    try {
        return await task();
    } catch (error) {
        const errorMessage = isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || "No se pudo completar la solicitud. Inténtalo nuevamente."
            : "No se pudo completar la solicitud. Comprueba tu conexión e inténtalo nuevamente.";
        setServerError(errorMessage);
        if (needAlert && showAlert) {
            showAlert(errorMessage, 5000, typeAlert.ERROR);
        }
        return null;
    } finally {
        setLoading(false);
    }
}

export default executeTask;
