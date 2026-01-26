import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (): void => {
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
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center justify-center size-8 bg-[#008060]/10 rounded-lg text-[#008060]">
              <span className="material-symbols-outlined text-[24px]">
                school
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-tight">
                IFPB
              </span>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest leading-none">
                SACD
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            {/* Link para o Perfil */}
            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center justify-center size-10 rounded-full text-slate-600 hover:bg-slate-100 hover:text-[#008060] transition-colors"
              title="Meu Perfil"
            >
              <span className="material-symbols-outlined text-[24px]">
                account_circle
              </span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Botão Sair */}
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
