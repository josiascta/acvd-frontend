import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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
  //add isLoadingSession
  const { session } = useAuth();

  const role = session?.role || "";

  // if (isLoadingSession) {
  //   return <Loading />;
  // }

  return (
    <BrowserRouter>
      <RouteSelector role={role} />
    </BrowserRouter>
  );
}
