import React, { useState } from "react";

interface Props {
  onSwitch: () => void;
}

const Register: React.FC<Props> = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered successfully!");
    onSwitch();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #0f172a, #1e3a8a)",
      }}
    >
      <h1
        style={{
          color: "white",
          marginBottom: "20px",
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        Lung Cancer Disease Prediction System
      </h1>

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Register</h3>

        <input
          type="text"
          placeholder="Create Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <p
          onClick={() => setShowPassword(!showPassword)}
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </p>

        <button onClick={handleRegister} style={buttonStyle}>
          Register
        </button>

        <p
          onClick={onSwitch}
          style={{
            marginTop: "12px",
            cursor: "pointer",
            color: "#2563eb",
          }}
        >
          Already user? Login
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "linear-gradient(to right, #2563eb, #9333ea)",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
  cursor: "pointer",
};

export default Register;