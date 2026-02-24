export const API_URL = "http://localhost:8080";

export const getHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const handleViewDocument = async (docId: string) => {
  try {
    const res = await fetch(`${API_URL}/documentos/${docId}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } else {
      alert("Não foi possível abrir o documento.");
    }
  } catch (error) {
    console.error(error);
  }
};
