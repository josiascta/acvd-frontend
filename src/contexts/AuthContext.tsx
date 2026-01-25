import { createContext } from "react";

type AuthContext = {
  session: null | UserResponse;
  save: (data: UserResponse) => void;
  logout: () => void;
  isLoadingSession: boolean;
};

export const AuthContext = createContext({} as AuthContext);
