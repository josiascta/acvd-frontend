import { Routes, Route } from "react-router-dom";
import { Login } from "../pages/Login";
import { NotFound } from "../pages/NotFound";
import { Layout } from "../components/Layout";

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Login />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
