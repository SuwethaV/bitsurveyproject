import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Box, CssBaseline, IconButton, InputBase,
  Avatar, Button, useMediaQuery, useTheme, Dialog
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Bag from "../assets/baaag.png";

const desktopDrawerWidth = 220;
const primaryColor200 = "#7B3DFF";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "My surveys", icon: <DescriptionIcon />, path: "/surveys" },
    { text: "Mentoring", icon: <GroupIcon />, path: "/mentoring" },
  ];
 
    

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const drawer = (
    <Box sx={{ height: "100vh", background: "#fff", color: "#000", p: 2 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: primaryColor200, mb: 2, fontFamily: "Poppins, sans-serif" }}
      >
        BIT SURVEY
      </Typography>
      <List>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderLeft: isActive ? `8px solid ${primaryColor200}` : "none",
                  ml: isActive ? "-14px" : "0",
                  borderRadius: "10px",
                }}
              >
                <ListItemIcon sx={{ color: "black" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: "black" }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ position: "absolute", bottom: 20, left: 16 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: "grey" }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", backgroundColor: "#fff" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          background: "#fff",
          color: "#000",
          width: { sm: `calc(100% - ${desktopDrawerWidth}px)` },
          ml: { sm: `${desktopDrawerWidth}px` },
          boxShadow: "none",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Left Side: Drawer Toggle & Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", fontSize: { xs: "16px", sm: "27px" } }}>
              Dashboard
            </Typography>
          </Box>

          {/* Center: Search Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f1f1f1",
              borderRadius: "20px",
              padding: "4px 10px",
              width: { xs: "140px", sm: "250px" },
              boxShadow: "none",
              ml: "auto",
            }}
          >
            <SearchIcon sx={{ color: "gray", mr: 1 }} />
            <InputBase
              placeholder="Search..."
              sx={{ flex: 1, fontSize: "14px" }}
            />
          </Box>

          {/* Right Side: Notifications & Settings Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.8, sm: 2 } }}>
            <IconButton sx={{ backgroundColor: "#F5F6FA", p: 1 }}>
              <SettingsIcon sx={{ color: "#7A7A7A", fontSize: { xs: "10px", sm: "24px" } }} />
            </IconButton>

            <IconButton sx={{ backgroundColor: "#F5F6FA", p: 1 }}>
              <NotificationsIcon sx={{ color: "#7A7A7A", fontSize: { xs: "10px", sm: "24px" } }} />
            </IconButton>

            <Avatar src="/assets/prof.png" sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 } }} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Component */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"} // Use temporary variant on mobile
        open={isMobile ? mobileOpen : true} // Use mobileOpen state for mobile view
        onClose={handleDrawerToggle} // Handle closing the drawer on mobile
        sx={{
          width: desktopDrawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: desktopDrawerWidth, boxSizing: "border-box" },
          ...(isMobile && { display: "block" }), // Ensure drawer is displayed on mobile
        }}
      >
        {drawer}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <img
          src={Bag}
          alt="No Surveys"
          style={{
            width: isMobile ? "80px" : "120px",
            height: isMobile ? "80px" : "120px",
            objectFit: "contain",
          }}
        />
        <Typography sx={{ mt: 2, fontWeight: "bold", fontSize: isMobile ? "13px" : "15px" }}>
          No Surveys Yet?
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: primaryColor200,
            borderRadius: "10px",
            px: 3,
            fontSize: isMobile ? "12px" : "14px",
            py: isMobile ? "6px" : "8px",
          }}
          onClick={() => setOpen(true)}
        >
          + New Survey
        </Button>

        {/* Modal Popup */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          sx={{ "& .MuiDialog-paper": { padding: 3, borderRadius: "12px" } }}
        >
          <Box sx={{ textAlign: "center", p: 3 }}>
            <CheckCircleIcon sx={{ color: "green", fontSize: 40, mb: 1 }} />
            <Typography sx={{ fontWeight: "bold", mb: 2 }}>Choose your choice</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" sx={{ backgroundColor: "#7B61FF" }} onClick={() => navigate("/templates")}>
                Templates
              </Button>
              <Button variant="contained" sx={{ backgroundColor: "#7B61FF" }} onClick={() => navigate("/create-new")}>
                Create New
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
