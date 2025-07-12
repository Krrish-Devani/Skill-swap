import React from 'react'

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"

// Import components
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import SignUp from "./pages/SignUp"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import BrowseUsers from "./pages/BrowseUsers"
import SkillMatches from "./pages/SkillMatches"
import Swaps from "./pages/Swaps"

function App() {

  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={ authUser ? <HomePage /> : <Navigate to={"/login"} />} />
          <Route path="/signup" element={ !authUser ? <SignUp /> : <Navigate to={"/"} />} />
          <Route path="/login" element={ !authUser ? <Login /> : <Navigate to={"/"} />} />
          <Route path="/profile" element={ authUser ? <Profile /> : <Navigate to={"/login"} />} />
          <Route path="/browse" element={ authUser ? <BrowseUsers /> : <Navigate to={"/login"} />} />
          <Route path="/skill-matches" element={ authUser ? <SkillMatches /> : <Navigate to={"/login"} />} />
          <Route path="/swaps" element={ authUser ? <Swaps /> : <Navigate to={"/login"} />} />
        </Routes>
      </main>

      <Toaster />

    </div>
  )
}

export default App