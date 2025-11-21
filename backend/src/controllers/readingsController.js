import { ReadingsModel } from "../models/readingsModel.js";

export const ReadingsController = {
  // ===========================================
  // PERUBAHAN: Menangani Pagination
  // ===========================================
  async list(req, res) {
    try {
      // 1. Ambil nomor halaman dari query URL (contoh: /api/readings?page=2)
      // Jika tidak ada, default ke halaman 1
      const page = parseInt(req.query.page) || 1;
      
      // 2. Tentukan jumlah data per halaman (Limit)
      // Kita set 5 agar pas di layar HP, tapi Anda bisa ubah jadi 10 atau 20
      const limit = 5; 

      // 3. Panggil Model dengan parameter page & limit
      const data = await ReadingsModel.list(page, limit);
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // ===========================================

  async latest(req, res) {
    try {
      const data = await ReadingsModel.latest();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const created = await ReadingsModel.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};