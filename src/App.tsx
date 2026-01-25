import { Routes } from "./routes";
import { AuthProvider } from "./contexts/AuthProvider";

export function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
