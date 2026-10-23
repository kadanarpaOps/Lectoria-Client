import { useContext } from "react"
import { UserContext } from "../context/UserContext";

export const useUsers = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error("userUsers must be used inside an UserProvider");
    }

    return userContext;
}