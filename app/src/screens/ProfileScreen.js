import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";

export function ProfileScreen() {
  const { user, isGuest, logout } = useAuth();

  // Handler untuk konfirmasi logout
  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.contentContainer}>
        
        {/* --- Header Profil --- */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          
          <Text style={styles.nameText}>
            {isGuest ? "Tamu (Guest)" : user?.email?.split("@")[0] || "Pengguna"}
          </Text>
          
          <Text style={styles.emailText}>
            {isGuest ? "Mode akses terbatas" : user?.email}
          </Text>
        </View>

        {/* --- Detail Informasi --- */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Detail Akun</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.badge, isGuest ? styles.badgeGuest : styles.badgeUser]}>
              <Text style={styles.badgeText}>{isGuest ? "Guest" : "Active User"}</Text>
            </View>
          </View>

          {!isGuest && user && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>User ID</Text>
                <Text style={styles.value}>{user.id.substring(0, 8)}...</Text>
              </View>
              
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Last Sign In</Text>
                <Text style={styles.value}>
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleDateString() 
                    : "-"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* --- Tombol Logout --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },
  contentContainer: {
    padding: 20,
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
  },
  value: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeUser: {
    backgroundColor: "#dbeafe",
  },
  badgeGuest: {
    backgroundColor: "#f3f4f6",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e40af",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  versionText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
  },
});