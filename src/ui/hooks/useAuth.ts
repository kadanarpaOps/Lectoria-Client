import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export const useAuth = () => {
    const authContext = useContext(AuthContext);
    
    if (!authContext) {
        throw new Error("userAuth must be used inside an AuthProvider");
    }

    return authContext;
}
