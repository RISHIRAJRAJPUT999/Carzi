import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import CarDetails from './pages/CarDetails';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CarOwnerSignup from './pages/CarOwnerSignup';
import CustomerDashboard from './pages/CustomerDashboard';
import CarOwnerDashboard from './pages/CarOwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import Career from './pages/Career';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CarProvider } from './contexts/CarContext';
import { BookingProvider } from './contexts/BookingContext';

function AppContent() {
  const { user } = useAuth();

  const getRedirectPath = (user: User) => {
    if (!user) return "/"; // Default to home if no user
    switch (user.type) {
      case 'customer':
        return "/";
      case 'car-owner':
        return "/car-owner-dashboard";
      case 'admin':
        return "/admin-dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ScrollToTop />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to={getRedirectPath(user)} /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to={getRedirectPath(user)} /> : <Signup />} 
          />
          <Route 
            path="/car-owner-signup" 
            element={user ? <Navigate to={getRedirectPath(user)} /> : <CarOwnerSignup />} 
          />
          <Route 
            path="/customer-dashboard" 
            element={
              user && user.type === 'customer' ? 
              <CustomerDashboard /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/car-owner-dashboard" 
            element={
              user && user.type === 'car-owner' ? 
              <CarOwnerDashboard /> : 
              <Navigate to="/login" />
            } 
          />
                    <Route path="/admin-dashboard" 
                      element={
                        user && user.type === 'admin' ? 
                        <AdminDashboard /> : 
                        <Navigate to="/login" />
                      } 
                    />
                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/career" element={<Career />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarProvider>
        <BookingProvider>
          <Router>
            <AppContent />
          </Router>
        </BookingProvider>
      </CarProvider>
    </AuthProvider>
  );
}

export default App;