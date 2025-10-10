import { login } from "@/api/auth/login.api";
import Home from "@/components/page/home";
import { Route, Routes } from "react-router-dom";

function App() {
    const u = "alex1";
    const p = "123";
    const handleLogin = async () => {
        const data = await login(u, p);
        console.log(data);
    };
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </>
    );
}

export default App;
