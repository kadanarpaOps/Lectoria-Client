
import type { UserModel } from "../models/users/UserModel";

export interface AuthUserPort {

  getUserProfile(): Promise<UserModel>;

}
