import type { RegisterUserRequest } from '../../../core/domain/models/users/UserModel';
import httpClient from '../config/axios.instance';

export const registerUserRequest = async (user: RegisterUserRequest): Promise<string> => {
    const response = await httpClient.post(`users`, user);
    return response.status.toString();
}
