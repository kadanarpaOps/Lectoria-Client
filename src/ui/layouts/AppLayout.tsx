import { BrowserRouter as Router, Route, Routes } from "react-router";
import LandingPage from "../pages/landing/LandingPage";


const AppLayout = () => {

  return (
        <Router>
         <Routes>
            
            <Route path="/" element={<LandingPage />} />

          </Routes>
        </Router>
  )
}

export default AppLayout;
    