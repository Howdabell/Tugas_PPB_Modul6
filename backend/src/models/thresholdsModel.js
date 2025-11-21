import { supabase } from "../config/supabaseClient.js";

const TABLE = "threshold_settings";

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    value: row.value === null ? null : Number(row.value),
  };
}

export const ThresholdsModel = {
  // Fungsi LIST dan LATEST tetap sama
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, value, note, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(normalize);
  },

  async latest() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, value, note, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalize(data);
  },

  // ===============================================
  // UPDATE LOGIKA CREATE: Delete semua, lalu Insert baru
  // ===============================================
  async create(payload) {
    const { value, note } = payload;

    if (typeof value !== "number") {
      throw new Error("value must be a number");
    }

    const row = {
      value,
      note: note?.slice(0, 180) ?? null,
    };

    // 1. Hapus SEMUA baris yang ada di tabel
    const { error: deleteError } = await supabase
      .from(TABLE)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Hapus semua

    if (deleteError) throw deleteError;

    // 2. Masukkan satu baris yang baru
    const { data, error: insertError } = await supabase
      .from(TABLE)
      .insert(row)
      .select("id, value, note, created_at")
      .single();

    if (insertError) throw insertError;
    return normalize(data);
  },
  // ===============================================

  // ===============================================
  // FUNGSI DELETE (Yang dibutuhkan Controller)
  // ===============================================
  async delete(id) {
    if (!id) {
      throw new Error("ID is required for deletion.");
    }

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .match({ id: id }); // Hapus baris berdasarkan ID

    if (error) throw error;
    return { message: `Threshold with ID ${id} deleted.` };
  },
};