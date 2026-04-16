import { Routes, Route } from "react-router-dom";
import { Layout } from "../components/Layout";
import { NotFound } from "../pages/NotFound";
import { Home } from "../pages/Home";
import { Perfil } from "../pages/Perfil";
import { CompletarPerfil } from "../pages/CompletarPerfil";
import { NovaViagemColetiva } from "../pages/NovaViagemColetiva";
import { DetalhesViagem } from "../pages/DetalhesViagem";
import { FormularioAnexoI } from "../pages/FormularioAnexoI";
import { FormularioAnexoIII } from "../pages/FormularioAnexoIII";

export function ServidorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/nova-viagem-coletiva" element={<NovaViagemColetiva />} />
        <Route path="/viagem/:id" element={<DetalhesViagem />} />
        <Route
          path="/viagem/:id/preencher-anexo-i"
          element={<FormularioAnexoI />}
        />
        <Route
          path="/viagem/:id/preencher-anexo-iii"
          element={<FormularioAnexoIII />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
