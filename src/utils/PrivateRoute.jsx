import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../utils/idb.jsx";

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const uname = params.get("user_id");

  // While loading, show spinner or loader
  if (loading) return <div className="text-center p-10">Loading...</div>;

  // Allow access if uname exists (bypassing auth)
  if (uname) return <Outlet />;

  // Regular auth check
  return user ? <Outlet /> : <Navigate to="/login" />;
}