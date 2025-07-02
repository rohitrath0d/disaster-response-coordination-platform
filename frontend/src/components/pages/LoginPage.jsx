// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const LoginPage = () => {
//   const [token, setToken] = useState("");
//   const [role, setRole] = useState("user");
//   const navigate = useNavigate();

//   const handleLogin = () => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("role", role);
//     if (role === "admin") {
//       // navigate("/dashboard");
//       navigate("/broadcast-panel");

//     } else {
//       navigate("/dashboard");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="bg-white p-6 rounded shadow w-full max-w-sm">
//         <h2 className="text-xl font-bold mb-4">Login</h2>

//         <label className="block mb-2 text-sm">Token:</label>
//         <input
//           value={token}
//           onChange={(e) => setToken(e.target.value)}
//           className="w-full border px-2 py-1 mb-4 rounded"
//           placeholder="Enter token"
//         />

//         <label className="block mb-2 text-sm">Role:</label>
//         <select
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//           className="w-full border px-2 py-1 mb-4 rounded"
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//         </select>

//         <button
//           onClick={handleLogin}
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//         >
//           Login
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import toast from "react-hot-toast";

const baseUrl = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const [view, setView] = useState("login"); // login | register | mock
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    token: "",
    role: "user"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleLogin = async () => {
  //   if (!form.email || !form.password) {
  //     alert("Please enter email and password");
  //     return;
  //   }
  //   try {
  //     const response = await axios.post(`${baseUrl}/api/auth/login`, {
  //       email: form.email,
  //       password: form.password,
  //     });

  //     // const { token, user } = res.data;
  //     // localStorage.setItem("token", token);
  //     // localStorage.setItem("user", JSON.stringify(user));
  //     // navigate("/sidebar/dashboard");

  //     if (response.data.success) {
  //       // 1. Store token and user data
  //       localStorage.setItem('authToken', response.data.token);
  //       localStorage.setItem('user', JSON.stringify(response.data.user));

  //       // 2. Set default Authorization header for all future requests
  //       axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

  //       // 3. Redirect (consider using state management instead)
  //       navigate("/sidebar/dashboard");

  //       // Optional: Refresh token logic can be added here
  //     }

  //   } catch (err) {
  //     alert(err.response?.data?.message || "Login failed");
  //   }
  // };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      if (response.data.success && response.data.token) {
        // Validate token format before storing
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format received");
        }

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        navigate("/sidebar/dashboard");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };



  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.confirm) {
      alert("Please fill all fields");
      return;
    }
    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}/api/auth/register`, {
        username: form.username,
        email: form.email,
        password: form.password
      });
      console.log(res);

      // alert("Registered successfully! Please login.");
      toast.success("Registered successfully! Please login.");
      setView("login");
    } catch (err) {
      // alert(err.response?.data?.message || "Registration failed");
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  // const handleMockLogin = () => {
  //   if (!form.token) return alert("Enter token");
  //   localStorage.setItem("token", form.token);
  //   localStorage.setItem("role", form.role);
  //   navigate(form.role === "admin" ? "/broadcast-panel" : "/sidebar/dashboard");
  // };

  const handleMockLogin = () => {
    if (!form.token) {
      setError("Please enter a mock token");
      return;
    }

    // Validate mock token format (example: at least 10 chars)
    if (form.token.length < 10) {
      setError("Mock token must be at least 10 characters");
      return;
    }

    localStorage.setItem("mockToken", form.token);
    localStorage.setItem("role", form.role);
    navigate(form.role === "admin" ? "/broadcast-panel" : "/sidebar/dashboard");
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {view === "register" ? "Register" : view === "mock" ? "Mock Login" : "Login"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

           {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}


          {view === "register" && (
            <>
              <input name="username" onChange={handleChange} placeholder="Username" className="w-full px-3 py-2 border rounded" />
              <input name="email" onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" />
              <input name="password" onChange={handleChange} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded" />
              <input name="confirm" onChange={handleChange} placeholder="Confirm Password" type="password" className="w-full px-3 py-2 border rounded" />
              <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700" onClick={handleRegister}>Register</button>
              <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer" onClick={() => setView("login")}>Already have an account? Login</p>
            </>
          )}

          {view === "login" && (
            <>
              <input name="email" onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" />
              <input name="password" onChange={handleChange} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded" />
              <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700" onClick={handleLogin}> {loading ? "Logging in..." : "Login"} </button>
              <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer" onClick={() => setView("register")}>New user? Register</p>
              <p className="text-sm text-center text-gray-600 cursor-pointer" onClick={() => setView("mock")}>Or try mock login</p>
            </>
          )}

          {view === "mock" && (
            <>
              <input name="token" onChange={handleChange} placeholder="Mock Token" className="w-full px-3 py-2 border rounded" />
              <select name="role" onChange={handleChange} className="w-full px-3 py-2 border rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700" onClick={handleMockLogin}>Mock Login</button>
              <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer" onClick={() => setView("login")}>Go back to login</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
