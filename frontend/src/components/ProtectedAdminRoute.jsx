import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ admin, children }) {
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
