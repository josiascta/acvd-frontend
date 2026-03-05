import { Routes, Route } from "react-router";
import { Layout } from "../components/Layout";
import { NotFound } from "../pages/NotFound";
import { Home } from "../pages/Home";
import { Perfil } from "../pages/Perfil";
import { CompletarPerfil } from "../pages/CompletarPerfil";
import { SolicitacaoIndividual } from "../pages/SolicitacaoIndividual";
import { MinhaRequisicao } from "../pages/MinhaRequisicao";

export function DiscenteRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route
          path="/solicitacao-individual"
          element={<SolicitacaoIndividual />}
        />
        <Route path="/minha-requisicao/:id" element={<MinhaRequisicao />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
