import { AxiosError } from "axios";
import { typeAlert } from "../providers/AlertProvider";

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
        let errorMessage = "Ocurrió un error en el servidor";
        if (error instanceof AxiosError) {
            errorMessage = error.response?.data?.message || errorMessage;
            setServerError(errorMessage);
            if (needAlert && showAlert) {
                showAlert(errorMessage, 5000, typeAlert.ERROR);
            }
        }
        return null;
    } finally {
        setLoading(false);
    }
}

export default executeTask;
