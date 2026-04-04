const BASE_URL = "http://localhost:5100";

export const fetchLogs = async () => {
  try {
    const res = await fetch(`${BASE_URL}/logs`);

    if (!res.ok) {
      throw new Error("Failed to fetch logs");
    }

    return await res.json();
  } catch (err) {
    console.error("API Error:", err.message);
    return [];
  }
};

export const downloadPDF = () => {
  window.open(`${BASE_URL}/logs/export`, "_blank");
};
