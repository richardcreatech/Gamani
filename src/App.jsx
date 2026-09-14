import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Auth from "./pages/Auth/Auth";
import GamaniSplash from "./pages/Splash/Gamanisplash";
import Home from "./pages/App/Home";

function ProtectedRoute() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/" replace />;
}

function SplashRoute() {
  const navigate = useNavigate();

  return (
    <GamaniSplash onComplete={() => navigate("/app", { replace: true })} />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />}>
        <Route path="" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/splash" element={<SplashRoute />} />
        <Route path="/app" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
