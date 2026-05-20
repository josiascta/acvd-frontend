import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { isMenorDeIdade } from "../../utils/date";

import { UserProfileCard } from "./components/UserProfileCard";
import { ContaBancariaSection } from "./components/ContaBancariaSection";
import { ResponsavelLegalSection } from "./components/ResponsavelLegalSection";

export function Perfil() {
  const navigate = useNavigate();
  const { session, isLoadingSession } = useAuth();

  useEffect(() => {
    if (!isLoadingSession && !session) {
      navigate("/login");
    } else if (!isLoadingSession && session && !session.matricula) {
      navigate("/completar-perfil");
    }
  }, [isLoadingSession, session, navigate]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fcfb]">
        <div className="animate-spin size-8 border-4 border-[#008060] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) return null;

  const isMenor = isMenorDeIdade(session?.dataNascimento);

  return (
    <div className="min-h-screen bg-[#f8fcfb] text-slate-900 font-sans antialiased pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <UserProfileCard session={session} />

        {session.role === "DISCENTE" && <ContaBancariaSection />}

        {session.role === "DISCENTE" && isMenor && <ResponsavelLegalSection />}
      </main>
    </div>
  );
}
