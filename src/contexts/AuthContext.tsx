import { createContext } from "react";
import type { UserResponse } from "../dtos/user";

type AuthContext = {
  session: null | UserResponse;
  save: (data: UserResponse) => void;
  logout: () => void;
  signInWithToken: (token: string) => Promise<UserResponse>;
  isLoadingSession: boolean;
};

export const AuthContext = createContext({} as AuthContext);
