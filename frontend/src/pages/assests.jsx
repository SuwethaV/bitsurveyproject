import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Box, CssBaseline, IconButton, InputBase,
  Avatar, Button, useMediaQuery, useTheme, Dialog, Paper, Grid, Card, CardContent
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
import FeedbackForm from "./Feedbackform";
import AcademicFeedbackForm from "./academicfb";
const desktopDrawerWidth = 220;
const primaryColor200 = "#7B3DFF";

const AssetsDict = () => {
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
              Templates
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${desktopDrawerWidth}px)` },
          marginTop: "64px",
        }}
      >
        {/* Use Grid to align the boxes in the same line */}
        <Grid container spacing={3}>
          {/* Assets Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column",backgroundColor:"#F5F8FE" }}>
              <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                Assets
                </Typography>
                <Typography variant="body1">
                  This template allows users to create structured product-related survey questions efficiently. It includes predefined question formats.
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
              <Button 
                    onClick={() => navigate("/producttemplate")}
                    variant="outlined" 
                    sx={{ 
                        width:"30px",
                        color: "white", 
                        borderColor: "#7F56D9",  
                        backgroundColor:"#7F56D9",
                        fontWeight: "bold" 
                    }}
                    >
                    Edit
             </Button>

              </Box>
            </Card>
          </Grid>

          {/* Skill Feedback Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column",backgroundColor:"#F5F8FE" }}>
              <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                Skill Feedback
                </Typography>
                <Typography variant="body1">
                  Gather valuable insights to enhance the academic experience through targeted feedback from students and faculty.
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
              <Button 
                    onClick={() => navigate("/Feedbackform")}
                    variant="outlined" 
                    fullWidth 
                    sx={{ 
                        width:"30px",
                        color: "white", 
                        borderColor: "#7F56D9",  
                        backgroundColor:"#7F56D9",
                        fontWeight: "bold" 
                    }}
                    >
                       
               
                    Edit
             </Button>

              </Box>
            </Card>
          </Grid>

          {/* Academic Feedback Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" ,backgroundColor:"#F5F8FE"}}>
              <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                Academic Feedback
                </Typography>
                <Typography variant="body1">
                  Gather valuable insights to enhance the academic experience through targeted feedback from students and faculty.
                </Typography>
              </CardContent>
              <Box sx={{ p: 2 }}>
              <Button 
                  onClick={() => navigate("/academicfb")}
                    variant="outlined" 
                    fullWidth 
                    sx={{ 
                        width:"30px",
                        color: "white", 
                        borderColor: "#7F56D9",  
                        backgroundColor:"#7F56D9",
                        fontWeight: "bold" 
                    }}
                    >
                    Edit
             </Button>

              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AssetsDict;