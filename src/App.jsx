import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Auth from "./pages/Auth/Auth";
import GamaniSplash from "./pages/Splash/Gamanisplash";
import Home from "./pages/App/Home";
// import Mail from "./pages/App/Main/Mail/Mail";
import Spotify from "./pages/App/Main/Music/Spotify";
import Connect_Spotify from "./pages/App/Main/Music/Connect_Spotify";
import Spotify_Main from "./pages/App/Main/Music/Spotify_Main";
import Discover from "./pages/App/Main/Music/Discover";



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

        <Route path="/splash" element={<SplashRoute />} />
        <Route path="/app" element={<Home />}>
          <Route path="" element={<Spotify />}>
            <Route path="" element={<Connect_Spotify />} />

            <Route path="spotify" element={<Spotify_Main />}>
              <Route path="" element={<Discover />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
    </Routes>
  );
}

export default App;
