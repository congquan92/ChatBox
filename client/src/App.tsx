import Home from "@/components/page/home";
import { AuthProvider } from "@/context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, GuestOnly } from "@/router/guards";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import NotFound from "@/components/page/404";
import Navbar from "@/components/page/navbar";
import Footer from "@/components/page/footer";

function SmartRedirect() {
    const hasToken = !!localStorage.getItem("token");
    return hasToken ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Routes>
                {/* KHÁCH: chỉ hiển thị khi CHƯA login */}
                <Route element={<GuestOnly />}>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                </Route>

                {/* ĐÃ LOGIN: phải có token mới vào được */}
                <Route element={<RequireAuth />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/chat" element={<Home />} />
                    <Route path="/404" element={<NotFound />} />
                </Route>

                {/* Catch-all routes */}
                <Route path="/" element={<SmartRedirect />} />
                <Route path="*" element={<SmartRedirect />} />
            </Routes>
            <Footer />
        </AuthProvider>
    );
}

export default App;
