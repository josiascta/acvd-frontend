import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
  const navigate = useNavigate();
  // Pegamos os dados do usuário (session) e a função de sair (logout) do contexto
  const { session, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Clicável para voltar ao Início */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center">
              <span className="text-base font-bold leading-tight text-green-700">
                IFPB ACVD
              </span>
            </div>
          </div>

          {/* Ações do Usuário */}
          <div className="flex items-center gap-2">
            {/* Botão Perfil: Mostra a FOTO do Google ou Ícone se não houver */}
            <button
              onClick={() => navigate("/perfil")}
              className="relative flex items-center justify-center size-10 rounded-full border-2 border-transparent hover:border-[#008060] transition-all overflow-hidden bg-slate-100"
              title="Meu Perfil"
            >
              {session?.fotoDePerfil ? (
                <img
                  src={session.fotoDePerfil}
                  alt="Perfil"
                  className="size-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[26px] text-slate-500">
                  account_circle
                </span>
              )}
            </button>

            {/* Divisor Visual */}
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Botão Sair - Usando a função logout do Contexto */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="hidden sm:inline">Sair</span>
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
