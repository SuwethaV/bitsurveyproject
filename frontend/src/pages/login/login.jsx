import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/logo.png";

const primaryColor200 = "#7B3DFF";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password_: "",
    role: "",
  });

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!formData.email || !formData.password_ || !formData.role) {
      setMessage({ type: "error", text: "❌ Please fill all fields." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/login", formData);
      if (res.data.success) {
        setMessage({ type: "success", text: "✅ Login successful! Redirecting..." });
        localStorage.setItem("token",res.data.token);
       
        const userData = {
          email: formData.email,
          role: formData.role,
          token: res.data.token,
          staffEmail: res.data.staffEmail,
          hasCreatedSurvey: res.data.hasCreatedSurvey
        };

        login(userData);

        let redirectPath = from;
        if (formData.role === "faculty") {
          redirectPath = res.data.hasCreatedSurvey ? "/dashboard" : "/dashboardnull";
        } else if (formData.role === "student") {
          redirectPath = "/userdashboard";
        }

        setTimeout(() => {
          // Only allow navigation through internal app flow
          sessionStorage.setItem("navOrigin", "internal");
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        setMessage({ type: "error", text: res.data.message });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "⚠️ Invalid credentials or server error."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      <Box sx={{
        width: 400,
        padding: 4,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        textAlign: "center"
      }}>
        <Typography
          variant="h6"
          sx={{
            ml: "110px",
            fontWeight: "bold",
            color: primaryColor200,
            mb: 2,
            fontFamily: "Poppins, sans-serif",
            display: "flex",
            alignItems: "center"
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "20px", height: "19px", marginRight: "8px" }}
          />
          BIT SURVEY
        </Typography>
       
        {message && (
          <Alert severity={message.type} sx={{ mt: 2, mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
         
          <TextField
            fullWidth
            label="Password"
            name="password_"
            type="password"
            value={formData.password_}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="faculty">Faculty</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading}
            sx={{
              mt: 2,
              backgroundColor: "#7B3DFF",
              "&:hover": {
                backgroundColor: "#5E2DB3",
              },
              height: "42px"
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <Typography sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/register")}
            sx={{ color: primaryColor200 }}
          >
            Register here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;