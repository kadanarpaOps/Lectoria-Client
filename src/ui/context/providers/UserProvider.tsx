import { useState, type ReactNode } from "react";
import executeTask from "../utils/TaskExecutor";
import type { RegisterUserRequest } from "../../../core/domain/models/users/UserModel";
import { UserContext, type UserContextType } from "../UserContext";
import { useAlert } from "../../hooks/useAlert";
import { UserService } from "../../../core/use-cases/UserUseCases";

type Props = {
    children: ReactNode;
}

const userService = new UserService();

function UserProvider({ children }: Props) {
    // Alert Component
    const { showAlert } = useAlert();
    // Basics
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const registerUser = async (data: RegisterUserRequest): Promise<boolean> => {
        const response = await executeTask(() => userService.registerUser(data), setLoading, setError, showAlert, true);
        console.log(response);
        if (!response) return false;
        return true;
    };

    // Export Values
    const exportValues: UserContextType = {
        loading,
        error,
        registerUser
    };

    return (
        <UserContext.Provider value={exportValues}>{children}</UserContext.Provider>
    )

}

export default UserProvider;