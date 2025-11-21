import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons"; // <-- Import Icon
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext.js";

export function ControlScreen() {
  // State thresholdValue sebagai string agar mudah diedit di TextInput
  const [thresholdValue, setThresholdValue] = useState("30");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { session, isGuest, logout } = useAuth();
  const token = session?.access_token;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Api.getThresholds();
      setHistory(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const latestThreshold = useMemo(() => history?.[0]?.value ?? null, [history]);

  const handleSubmit = useCallback(async () => {
    const valueNumber = Number(thresholdValue);
    if (Number.isNaN(valueNumber)) {
      setError("Please enter a numeric threshold.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await Api.createThreshold({ value: valueNumber, note }, token);
      setNote("");
      await fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [thresholdValue, note, fetchHistory, token]);

  const handleDelete = useCallback((id) => {
    Alert.alert(
      "Delete Item",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Api.deleteThreshold(id, token);
              fetchHistory();
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          }
        }
      ]
    );
  }, [token, fetchHistory]);

  // --- TAMPILAN GUEST ---
  if (isGuest) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.card}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Access Restricted</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
            You are using Guest Mode. Please login to configure thresholds.
          </Text>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Login Now</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '100%', marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Current Configuration (View Only)</Text>
          <DataTable
            columns={[
              { key: "created_at", title: "Date", render: (v) => new Date(v).toLocaleDateString() },
              { key: "value", title: "Value", render: (v) => `${v}°C` }
            ]}
            data={history}
            keyExtractor={i => i.id}
          />
        </View>
      </SafeAreaView>
    );
  }

  // --- TAMPILAN UTAMA ---
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* --- TOMBOL LOGOUT MODERN --- */}
          <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10}}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {/* ----------------------------- */}

          <View style={styles.card}>
            <Text style={styles.title}>Configure Threshold</Text>
            {latestThreshold !== null && (
              <Text style={styles.metaText}>
                Current threshold: {Number(latestThreshold).toFixed(2)}°C
              </Text>
            )}
            
            <Text style={styles.label}>Threshold (°C)</Text>
            {/* Kita gunakan TextInput agar aman di Expo Go */}
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(thresholdValue)}
              onChangeText={setThresholdValue}
              placeholder="Enter threshold (e.g. 30)"
            />

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              placeholder="Describe why you are changing the threshold"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Threshold</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Threshold History</Text>
            {loading && <ActivityIndicator />}
          </View>
          <DataTable
            columns={[
              {
                key: "created_at",
                title: "Saved At",
                render: (value) => (value ? new Date(value).toLocaleString() : "--"),
              },
              {
                key: "value",
                title: "Threshold (°C)",
                render: (value) =>
                  typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
              },
              {
                key: "note",
                title: "Note",
                render: (value) => value || "-",
              },
              {
                key: "id",
                title: "Action",
                render: (id) => (
                  <TouchableOpacity onPress={() => handleDelete(id)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                  </TouchableOpacity>
                )
              }
            ]}
            data={history}
            keyExtractor={(item) => item.id}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f8f9fb",
  },
  // --- STYLE TOMBOL LOGOUT ---
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2", // Merah muda lembut
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, // Bentuk kapsul
    // Bayangan tipis
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: "#dc2626", // Merah tua
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  // --------------------------
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    marginTop: 16,
    fontWeight: "600",
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  metaText: {
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    color: "#c82333",
    fontWeight: "600",
  }
});