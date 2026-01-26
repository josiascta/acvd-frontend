import { Routes, Route } from "react-router-dom";
import { Login } from "../pages/Login";
import { NotFound } from "../pages/NotFound";

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login-success" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
