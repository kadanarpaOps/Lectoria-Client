import { useState, type ReactNode } from "react"
import { AlertContext } from "../AlertContext";
import Alert from "../../components/alert/Alert";
import { typeAlert } from "../AlertTypes";

function AlertProvider({children}: {children: ReactNode}) {
  const [alert, setAlert] = useState<{ message: string; duration?: number; type?: string } | null>(null);

  const showAlert = (message: string, duration = 10000, type: string = typeAlert.ERROR) => {
    setAlert({ message, duration, type });
  }

  const handleClose = () => setAlert(null);
  return (
    <AlertContext.Provider value={{showAlert}}>
      {children}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={alert.duration}
          onClose={handleClose}
        />
      )}
    </AlertContext.Provider>
  );
}

export default AlertProvider