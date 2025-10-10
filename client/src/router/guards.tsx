import { Navigate, Outlet, useLocation } from "react-router-dom";

function hasToken() {
    return !!localStorage.getItem("token");
}

// Đã login mới vào được
export function RequireAuth() {
    const location = useLocation();
    return hasToken() ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

// Chưa login mới vào được
export function GuestOnly() {
    return hasToken() ? <Navigate to="/home" replace /> : <Outlet />;
}
