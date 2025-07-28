import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
// import LoginForm from "./components/LoginForm";
// import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";

const AuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    // <LoginForm onToggle={() => setIsLogin(false)} />
    <div>Login Form</div>
  ) : (
    // <RegisterForm onToggle={() => setIsLogin(true)} />
    <div>Register Form</div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={user ? <Dashboard /> : <AuthFlow />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;