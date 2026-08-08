import { Navigate } from "react-router-dom";
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;