import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, Alert, Link, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    userID: "", // Matches database column name
    role_: "",  // Matches database column name
    password_: "", // Matches database column name
  });

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Ensure all fields are filled
    if (!formData.email || !formData.userID || !formData.role_ || !formData.password_) {
      setMessage({ type: "error", text: "❌ Please fill all fields." });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/register", formData);
      if (res.data.success) {
        setMessage({ type: "success", text: "✅ Registration successful! Redirecting to login..." });
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setMessage({ type: "error", text: res.data.message });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      setMessage({ type: "error", text: "⚠️ Server error. Please try again later." });
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw" }}>
      <Box sx={{ width: 400, padding: 4, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper", textAlign: "center" }}>
        <Typography variant="h5">Register</Typography>
        {message && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Enroll No (User ID)" name="userID" value={formData.userID} onChange={handleChange} margin="normal" required />

          {/* Role Dropdown */}
          <TextField fullWidth select label="Role" name="role_" value={formData.role_} onChange={handleChange} margin="normal" required>
            <MenuItem value="faculty">Faculty</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <TextField fullWidth label="Password" name="password_" type="password" value={formData.password_} onChange={handleChange} margin="normal" required />

          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
            Register
          </Button>
        </form>

        {/* Login Link */}
        <Typography sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link component="button" variant="body2" onClick={() => navigate("/login")}>Login here</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;