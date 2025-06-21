import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/report");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <label className="block mb-2 text-sm">Token:</label>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full border px-2 py-1 mb-4 rounded"
          placeholder="Enter token"
        />

        <label className="block mb-2 text-sm">Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-2 py-1 mb-4 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
