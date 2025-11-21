import { BACKEND_URL } from "./config.js";

// Tambahkan parameter token
async function request(path, options = {}, token = null) {
  if (!BACKEND_URL) throw new Error("BACKEND_URL not set");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Jika ada token, kirim di header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || `Request failed: ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

export const Api = {
  // ==========================================================
  // PERUBAHAN: Menambahkan parameter 'page' untuk Pagination
  // ==========================================================
  
  // Monitoring (Public)
  getSensorReadings(page = 1) { 
    return request(`/api/readings?page=${page}`); 
  },

  getNegativeReadings(page = 1) { 
    return request(`/api/negative-readings?page=${page}`); 
  },

  getThresholds() { 
    return request("/api/thresholds"); 
  },
  // ==========================================================


  // Control (Protected - Butuh Token)
  createThreshold(payload, token) {
    return request("/api/thresholds", {
      method: "PUT",
      body: JSON.stringify(payload),
    }, token);
  },

  deleteThreshold(id, token) {
    return request(`/api/thresholds/${id}`, {
      method: "DELETE",
    }, token);
  },

  registerDevice(token) {
    return request("/api/devices", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};