// App.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage.jsx";
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import NotificationPage from "./pages/notification/NotificationPage.jsx";
import BounceLoader from "react-spinners/BounceLoader.js";

import Sidebar from "./components/common/Sidebar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";

import { Toaster } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

function App() {
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if (data.error) return null;
        if (!res.ok) throw new Error(data.error);
        return data;
      } catch (error) {
        console.log(error.message);
        throw error;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <>
        <div className="h-screen flex justify-center items-center">
          <BounceLoader size={120} color="rgb(18, 144, 230)" />
        </div>
      </>
    );
  }

  return (
    <div className="flex">
      {/* Common component, because it's not wrapped with Routes */}
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
