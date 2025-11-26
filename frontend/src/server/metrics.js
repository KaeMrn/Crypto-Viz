import api from "./client";

export async function getLatestMetrics() {
  const res = await api.get("/metrics/latest");
  return res.data;
}

export async function getCoinHistory(coin) {
  const res = await api.get(`/metrics/history?coin=${coin}`);
  return res.data;
}

// Convert metrics object to trending list
export async function getTrending() {
  const metrics = await getLatestMetrics();
  
  // metrics is already an object like { "BTC": 123, "ETH": 45, ... }
  return Object.entries(metrics)
    .map(([coin, mentions]) => ({ coin, mentions }))
    .sort((a, b) => b.mentions - a.mentions);
}
