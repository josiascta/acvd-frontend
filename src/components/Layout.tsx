import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "react-hot-toast";

export function Layout() {
  return (
    <div>
      <Header />

      <Outlet />

      <Footer />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#334155",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", // shadow-xl
            borderRadius: "9999px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid #f1f5f9",
          },
          success: {
            iconTheme: {
              primary: "#008060",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </div>
  );
}
