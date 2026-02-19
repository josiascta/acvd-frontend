import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AuthRoutes } from "./AuthRoutes";
import { ServidorRoutes } from "./ServidorRoutes";
import { DiscenteRoutes } from "./DiscenteRoutes";
//import { Loading } from "../components/Loading";

type RouteSelectorProps = {
  role: string;
};

function RouteSelector({ role }: RouteSelectorProps) {
  switch (role) {
    case "SERVIDOR":
      return <ServidorRoutes />;
    case "DISCENTE":
      return <DiscenteRoutes />;
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
