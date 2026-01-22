import { BrowserRouter } from "react-router-dom";
//import { useAuth } from "../hooks/useAuth";
import { AuthRoutes } from "./AuthRoutes";
//import { ProfessorRoutes } from "./ProfessorRoutes";
import { AlunoRoutes } from "./AlunoRoutes";
//import { Loading } from "../components/Loading";

type RouteSelectorProps = {
  role: string;
};

function RouteSelector({ role }: RouteSelectorProps) {
  switch (role) {
    //case "PROFESSOR":
    //return <ProfessorRoutes />;
    case "ALUNO":
      return <AlunoRoutes />;
    default:
      return <AuthRoutes />;
  }
}

export function Routes() {
  //const { session, isLoadingSession } = useAuth();

  const role = "ALUNO";

  // if (isLoadingSession) {
  //   return <Loading />;
  // }

  return (
    <BrowserRouter>
      <RouteSelector role={role} />
    </BrowserRouter>
  );
}
