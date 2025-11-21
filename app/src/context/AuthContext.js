import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // Tambahan state user
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek sesi saat aplikasi dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listener perubahan auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) setIsGuest(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fungsi Login
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // === FITUR BARU: REGISTER ===
  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // options: { data: { full_name: 'Nama User' } } // Bisa tambah data lain jika mau
    });
    
    if (error) throw error;
    
    // Jika "Confirm Email" di Supabase ON, data.session akan null di sini.
    // Jika OFF, user langsung login otomatis.
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return data;
  };

  // Fungsi Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    setUser(null);
    setSession(null);
  };

  // Masuk sebagai Tamu
  const enterAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isGuest, 
      loading, 
      login, 
      register, // <-- Export fungsi register
      logout, 
      enterAsGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);