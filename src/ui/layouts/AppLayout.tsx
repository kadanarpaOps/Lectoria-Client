import { BrowserRouter as Router, Route, Routes } from "react-router";
import LandingPage from "../pages/landing/LandingPage";
import AuthLayout from "./AuthLayout";
import Auth from "../pages/Auth/Login&Register";
import ErrorPage from "../pages/errors/ErrorPage";

const AppLayout = () => {

  return (
        <Router>
         <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/auth" element={<Auth />} />
            </Route>
            <Route path="/" element={<LandingPage />} />
            <Route path="/forbidden" element={<ErrorPage statusCode={403} messageError="No tienes Permisos para explorar por aquí..." />} />
            <Route path="/unauthorized" element={<ErrorPage statusCode={220} messageError="Error 220 Teclado Elevado, bailemos!!" />} />
            <Route path="/network-lost" element={<ErrorPage statusCode={500} messageError="Regálanos unos minutos en lo que se restaura la conexión..." />} />
            <Route path="*" element={<ErrorPage statusCode={404} messageError="Página no encontrada" />} />
          </Routes>
        </Router>
  )
}

export default AppLayout;
    