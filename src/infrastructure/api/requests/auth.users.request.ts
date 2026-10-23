import type { UserModel } from '../../../core/domain/models/users/UserModel';
import httpClient from '../config/axios.instance';

export const getUserProfileRequest = async (): Promise<UserModel> => {
    const response = await httpClient.get(`auth/user/profile`);
    return response.data;
}
