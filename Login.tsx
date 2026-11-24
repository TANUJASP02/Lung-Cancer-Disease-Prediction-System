import React, { useState } from "react";

interface Props {
  onLogin: () => void;
  onSwitch: () => void;
}

const Login: React.FC<Props> = ({ onLogin, onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const validUser = users.find(
      (u: any) => u.username === username && u.password === password
    );

    if (validUser) {
      localStorage.setItem("currentUser", username);
      onLogin();
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #0f172a, #1e3a8a)"
      }}
    >
      {/* 🔷 TITLE OUTSIDE BOX */}
      <h1
        style={{
          color: "white",
          marginBottom: "30px",
          fontSize: "32px",
          fontWeight: "700",
          textAlign: "center"
        }}
      >
        Lung Cancer Disease Prediction System
      </h1>

      {/* 🔲 LOGIN BOX */}
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Login</h3>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none"
          }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none"
          }}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            background: "linear-gradient(to right, #2563eb, #9333ea)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Login
        </button>

        {/* Register */}
        <button
          onClick={onSwitch}
          style={{
            marginTop: "12px",
            background: "transparent",
            border: "none",
            color: "#2563eb",
            fontWeight: "500",
            cursor: "pointer"
          }}
        >
          New user? Register
        </button>
      </div>
    </div>
  );
};

export default Login;