import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the User interface
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  type: 'customer' | 'car-owner' | 'admin';
  createdAt: string; // <-- ADD THIS LINE
  aadhaar?: string;
  verified?: boolean;
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => void;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  sendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('carzi_user');
    const storedToken = localStorage.getItem('carzi_token');

    if (storedUser && storedUser !== 'undefined' && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('carzi_user');
        localStorage.removeItem('carzi_token');
      }
    }
    setLoading(false);
  }, []);

  // --- LOGIN --- //
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('carzi_user', JSON.stringify(data.user));
        localStorage.setItem('carzi_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server error during login' };
    }
  };

  // --- SIGNUP --- //
  const signup = async (userData: any) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // ONLY log in 'customer' types immediately.
        // Car-owners must log in separately after verifying their OTP.
        if (data.user.type === 'customer') {
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('carzi_user', JSON.stringify(data.user));
            localStorage.setItem('carzi_token', data.token);
        }
        return { success: true, user: data.user };
      }

      return { success: false, message: data.message || 'Signup failed' };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, message: 'Server error during signup' };
    }
  };

  // --- LOGOUT --- //
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('carzi_user');
    localStorage.removeItem('carzi_token');
  };

  // --- OTP Functions --- //
  const sendOTP = async (email: string) => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        return { success: res.ok && data.success, message: data.message };
    } catch (err) {
        console.error('Send OTP error:', err);
        return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        return { success: res.ok && data.success, message: data.message };
    } catch (err) {
        console.error('Verify OTP error:', err);
        return { success: false, message: 'OTP verification failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, sendOTP, verifyOTP }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};