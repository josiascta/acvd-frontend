import { Routes, Route } from "react-router";
import { Layout } from "../components/Layout";
import { NotFound } from "../pages/NotFound";
import { Home } from "../pages/Home";
import { Perfil } from "../pages/Perfil";
import { Login } from "../pages/Login";
import { CompletarPerfil } from "../pages/CompletarPerfil"; 

export function AlunoRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login-success" element={<Login />} /> 
      <Route path="/completar-perfil" element={<CompletarPerfil />} />

      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}