import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AddDirectQuery from "./pages/AddDirectQuery";
import "./App.css";
import { Toaster } from "react-hot-toast";
import Layout from "./layouts/Layout";
import DirectQueryList from "./pages/DirectQueryList";
import { AuthProvider } from "./utils/idb.jsx";
import { useAuth } from "./utils/idb.jsx";
import PrivateRoute from "./utils/PrivateRoute.jsx";

function AutoLoginWrapper({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setUserFetched,setPermissionDenied } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("user_id");

    if (userId) {
      fetch(
        `https://instacrm.rapidcollaborate.com/directqueryapi/getuserbyid?user_id=${userId}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => {
          if (data.status && data.data) {
            login(data.data);
            setUserFetched(true);
            if(data.data.user_type=="admin" || data.data.user_type=="Data Manager"){
              setPermissionDenied(false);
            }else{
              setPermissionDenied(true);
            }
            // Redirect to home after login
            navigate("/", { replace: true, state: { from: location } });
          } else {
            console.error("User not found:", data.message);
            navigate("/", { state: { error: "Login failed" } });
          }
        })
        .catch((err) => {
          console.error("Auto-login error:", err);
          navigate("/", { state: { error: err.message } });
        });
    }
  }, [location.search, login, navigate]);

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AutoLoginWrapper>
          <Routes>

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DirectQueryList />} />
            </Route>

            <Route element={<Layout />}>
              <Route path="/addquery" element={<AddDirectQuery />} />
            </Route>
          </Routes>
        </AutoLoginWrapper>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
