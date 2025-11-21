import { useCallback, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

export function MonitoringScreen() {
  const { temperature, timestamp, connectionState, error: mqttError } = useMqttSensor();
  
  // State Data Utama
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // State Pagination
  const [page, setPage] = useState(1); 

  // Fungsi ambil data (Triggered Readings)
  const fetchReadings = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await Api.getSensorReadings(pageNumber);
      setReadings(data ?? []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load awal
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchReadings(1);
    }, [fetchReadings])
  );

  // Polling otomatis (hanya untuk tabel utama)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReadings(page); 
    }, 10000); 
    return () => clearInterval(interval);
  }, [page, fetchReadings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await fetchReadings(1);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings]);

  // Handler Tombol
  const handleNext = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReadings(nextPage);
  };

  const handlePrev = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchReadings(prevPage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Kartu Realtime */}
        <View style={styles.card}>
          <Text style={styles.title}>Realtime Temperature</Text>
          <View style={styles.valueRow}>
            <Text style={styles.temperatureText}>
              {typeof temperature === "number" ? `${temperature.toFixed(2)}°C` : "--"}
            </Text>
          </View>
          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>Last update: {new Date(timestamp).toLocaleTimeString()}</Text>
          )}
          {mqttError && <Text style={styles.errorText}>MQTT error: {mqttError.message || mqttError}</Text>}
        </View>

        {/* Tabel Triggered Readings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Triggered Readings History</Text>
          {loading && <ActivityIndicator size="small" color="#2563eb" />}
        </View>
        {apiError && <Text style={styles.errorText}>{apiError}</Text>}
        
        <DataTable
          columns={[
            { key: "recorded_at", title: "Time", render: (v) => v ? new Date(v).toLocaleTimeString() : "--" },
            { key: "temperature", title: "Temp (°C)", render: (v) => v ? `${Number(v).toFixed(2)}` : "--" },
            { key: "threshold_value", title: "Limit (°C)", render: (v) => v ? `${Number(v).toFixed(2)}` : "--" },
          ]}
          data={readings}
          keyExtractor={(item) => item.id}
        />

        {/* Pagination Controls */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity 
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]} 
            onPress={handlePrev}
            disabled={page === 1 || loading}
          >
            <Ionicons name="chevron-back" size={20} color={page === 1 ? "#94a3b8" : "#fff"} />
            <Text style={[styles.pageButtonText, page === 1 && styles.textDisabled]}>Prev</Text>
          </TouchableOpacity>

          <View style={styles.pageBadge}>
             <Text style={styles.pageBadgeText}>Page {page}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.pageButton, readings.length === 0 && styles.pageButtonDisabled]} 
            onPress={handleNext}
            disabled={readings.length === 0 || loading} 
          >
            <Text style={[styles.pageButtonText, readings.length === 0 && styles.textDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={readings.length === 0 ? "#94a3b8" : "#fff"} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { fontSize: 16, fontWeight: "600", color: "#64748b", marginBottom: 8 },
  valueRow: { flexDirection: "row", alignItems: "baseline" },
  temperatureText: { fontSize: 56, fontWeight: "800", color: "#2563eb" },
  metaText: { marginTop: 6, color: "#94a3b8", fontSize: 12 },
  errorText: { marginTop: 8, color: "#ef4444", fontSize: 12 },
  
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40, 
    paddingHorizontal: 10,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pageButtonDisabled: {
    backgroundColor: "#e2e8f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginHorizontal: 5,
  },
  textDisabled: {
    color: "#94a3b8",
  },
  pageBadge: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pageBadgeText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 12,
  },
});