import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import {
  Grid, Card, CardContent, Typography, Box, Button,
  IconButton, InputBase, AppBar, Toolbar, Avatar, AvatarGroup,
  LinearProgress, Divider, Drawer, List, ListItem, ListItemIcon,
  ListItemText, CssBaseline, useMediaQuery, useTheme, ListItemButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Radio, RadioGroup, FormControlLabel,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import {
  Search as SearchIcon, Notifications as NotificationsIcon,
  Settings as SettingsIcon, Menu as MenuIcon,
  Dashboard as DashboardIcon, ExitToApp as ExitToAppIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import Logo from "../assets/logo.png";
import user1 from "../assets/a.png";
import user2 from "../assets/m.png";
import user3 from "../assets/d.png";
import PLUSICON from "../assets/PLUS.png";

function getRandomColor() {
  const colors = [
    '#7B61FF', '#FF6B6B', '#48BB78', '#ED8936', 
    '#4299E1', '#9F7AEA', '#F56565', '#38B2AC'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const desktopDrawerWidth = 220;
const primaryColor200 = "#7B3DFF";

const MentorDashboard = () => {
  const [surveys, setSurveys] = useState({ live: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("Live");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [pendingData, setPendingData] = useState({ mentees: [], total: 0, pending: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState("");
  const [activeTab, setActiveTab] = useState("completed");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [completionData, setCompletionData] = useState({
    assigned_to: '',
    total: 0,
    completed: 0,
    not_completed: 0,
    completed_students: [],
    not_completed_students: []
  });
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const handleNotifyAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/notify-students", {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          survey_title: selectedSurvey?.survey_title,
          student_emails: pendingData.mentees.map(mentee => mentee.email),
          start_date: selectedSurvey?.start_date,
          end_date: selectedSurvey?.end_date
        })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || "Notifications sent successfully!");
        setOpenDialog(false);
        fetchMenteeSurveys(); // Refresh the data
      } else {
        throw new Error(data.error || "Failed to send notifications");
      }
    } catch (error) {
      console.error("Error notifying students:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchMenteeSurveys();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  
  const isMatch = (student) => {
    return (
      student.name.toLowerCase().includes(searchTerm) ||
      (student.rollno && student.rollno.toLowerCase().includes(searchTerm))
    );
  };

  // const fetchMenteeSurveys = async () => {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("token");
  //     const response = await fetch("http://localhost:3000/get-mentee-surveys", {
  //       method: "GET",
  //       headers: {
  //         Authorization: token,
  //         "Content-Type": "application/json"
  //       }
  //     });
  //     const data = await response.json();
      
  //     // Fetch completion data for each survey
  //     const surveysWithCompletion = await Promise.all(
  //       data.live.map(async (survey) => {
  //         try {
  //           const completionResponse = await fetch(
  //             `http://localhost:3000/get-survey-completion?survey_title=${survey.survey_title}`,
  //             { headers: { Authorization: token } }
  //           );
  //           const completionData = await completionResponse.json();
  //           return {
  //             ...survey,
  //             totalStudents: completionData.total || 0,
  //             completedStudents: completionData.completed || 0
  //           };
  //         } catch (error) {
  //           console.error("Error fetching completion data:", error);
  //           return survey;
  //         }
  //       })
  //     );
  
  //     setSurveys({
  //       live: surveysWithCompletion,
  //       completed: data.completed
  //     });
  //   } catch (error) {
  //     console.error("Error fetching mentee surveys:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchMenteeSurveys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/get-mentee-surveys", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      
      // Fetch completion data for live surveys
      const liveWithCompletion = await Promise.all(
        data.live.map(async (survey) => {
          try {
            const completionResponse = await fetch(
              `http://localhost:5000/get-survey-completion?survey_title=${survey.survey_title}`,
              { headers: { Authorization: token } }
            );
            const completionData = await completionResponse.json();
            return {
              ...survey,
              totalStudents: completionData.total || 0,
              completedStudents: completionData.completed || 0
            };
          } catch (error) {
            console.error("Error fetching completion data:", error);
            return survey;
          }
        })
      );
  
      // Fetch completion data for completed surveys
      const completedWithCompletion = await Promise.all(
        data.completed.map(async (survey) => {
          try {
            const completionResponse = await fetch(
              `http://localhost:5000/get-survey-completion?survey_title=${survey.survey_title}`,
              { headers: { Authorization: token } }
            );
            const completionData = await completionResponse.json();
            return {
              ...survey,
              totalStudents: completionData.total || 0,
              completedStudents: completionData.completed || 0
            };
          } catch (error) {
            console.error("Error fetching completion data:", error);
            return survey;
          }
        })
      );
  
      setSurveys({
        live: liveWithCompletion,
        completed: completedWithCompletion
      });
    } catch (error) {
      console.error("Error fetching mentee surveys:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSurveyClick = async (survey) => {
    setSelectedSurvey(survey);
    try {
      const token = localStorage.getItem("token");
      
      if (selectedOption === "Live") {
        const response = await fetch(
          `http://localhost:5000/get-pending-mentees?survey_title=${survey.survey_title}`,
          { 
            headers: { 
              Authorization: token,
              "Content-Type": "application/json"
            } 
          }
        );
  
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorData}`);
        }
  
        const data = await response.json();
        setPendingData(data);
        setOpenDialog(true);
      } else {
        const completionUrl = `http://localhost:5000/get-survey-completion?survey_title=${survey.survey_title}`;
        const statsUrl = `http://localhost:5000/get-menteesurvey-statistics/${encodeURIComponent(survey.survey_title)}`;
  
        const headers = {
          Authorization: token,
          "Content-Type": "application/json"
        };
  
        const [completionResponse, statsResponse] = await Promise.all([
          fetch(completionUrl, { headers }),
          fetch(statsUrl, { headers })
        ]);
  
        // Check both responses before parsing JSON
        if (!completionResponse.ok) {
          const errorText = await completionResponse.text();
          throw new Error(`Completion data error: ${completionResponse.status} - ${errorText}`);
        }
  
        if (!statsResponse.ok) {
          const errorText = await statsResponse.text();
          throw new Error(`Statistics error: ${statsResponse.status} - ${errorText}`);
        }
  
        const [completionData, statsData] = await Promise.all([
          completionResponse.json(),
          statsResponse.json()
        ]);
  
        setCompletionData({
          ...completionData,
          statistics: statsData
        });
        setCompletionDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching survey data:", error);
      alert(`Error loading survey data: ${error.message}`);
    }
  };
  
  // Add this renderStatisticsTab function
  const renderStatisticsTab = () => {
    if (!completionData.statistics) return <Typography>Loading statistics...</Typography>;
  
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, color: "#7F56D9", fontWeight: 'bold' }}>
          Survey Statistics
        </Typography>
        
        {completionData.statistics.questions.map((question, qIndex) => (
          <Box key={qIndex} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {question.question_text}
            </Typography>
            
            {question.texts ? (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                This is a text feedback question. No statistics available.
              </Typography>
            ) : (
              question.options.map((option, oIndex) => (
                <Box key={oIndex} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{option.option_text}</Typography>
                    <Typography variant="body2">{option.percentage}% ({option.count}/{completionData.statistics.totalCompleted})</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={option.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#EDE9FE',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#7F56D9',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              ))
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const filteredMentees = pendingData.mentees.filter(mentee =>
    mentee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Mentoring", icon: <GroupIcon />, path: "/menteedashboard" },
  ];

  const drawer = (
    <Box sx={{ height: "100vh", background: "#fff", color: "#000", p: 2 }}>
      <Typography
        variant="h6"
        sx={{
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

      <List>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: "black" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: "black" }} />
            </ListItemButton>
          </ListItem>
        ))}
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
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#fff" }}>
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", fontSize: { xs: "16px", sm: "27px" } }}>
              Mentoring
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f1f1f1",
              borderRadius: "20px",
              padding: "4px 10px",
              width: "250px",
              ml: "auto",
            }}
          >
            <SearchIcon sx={{ color: "gray", mr: 1 }} />
            <InputBase
              placeholder="Search..."
              sx={{ flex: 1, fontSize: "14px" }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.8, sm: 2 } }}>
            <IconButton sx={{ backgroundColor: "#F5F6FA", p: 1 }}>
              <SettingsIcon sx={{ color: "#7A7A7A", fontSize: { xs: "10px", sm: "24px" } }} />
            </IconButton>

            <IconButton sx={{ backgroundColor: "#F5F6FA", p: 1 }}>
              <NotificationsIcon sx={{ color: "#7A7A7A", fontSize: { xs: "10px", sm: "24px" } }} />
            </IconButton>

            <Avatar  sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 } }} />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: desktopDrawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: desktopDrawerWidth, boxSizing: "border-box" },
          ...(isMobile && { display: "block" }),
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${desktopDrawerWidth}px)` },
          marginTop: "64px",
        }}
      >
        <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
          {["Live", "Completed"].map((option) => (
            <Button
              key={option}
              onClick={() => setSelectedOption(option)}
              disableRipple
              sx={{
                textTransform: "none",
                color: selectedOption === option ? primaryColor200 : "text.secondary",
                borderBottom: selectedOption === option ? `2px solid ${primaryColor200}` : "none",
                borderRadius: 0,
                padding: 0,
                minWidth: "auto",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              {option} ({option === "Live" ? surveys.live.length : surveys.completed.length})
            </Button>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {(selectedOption === "Live" ? surveys.live : surveys.completed).map((survey, index) => {
              const isLive = selectedOption === "Live";
              const startDate = new Date(survey.start_date).toLocaleDateString('en-CA');
              const progress = isLive ? 30 : 100;
              const creatorName = survey.staff_email.split('@')[0].split('.')[0].toUpperCase();

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    onClick={() => handleSurveyClick(survey)}
                    sx={{
                      backgroundColor: "#F5F8FE",
                      cursor: "pointer",
                      "&:hover": { boxShadow: 3 },
                      borderRadius: "10px",
                      position: "relative",
                      height: "240px"
                    }}
                  >
                    <CardContent>
                      <Typography variant="body2" gutterBottom sx={{ color: "#4A4A4A" }}>
                        {startDate}
                      </Typography>

                      <Typography variant="h6" gutterBottom sx={{ color: "#27104E", fontWeight: 600 }}>
                        {survey.survey_title}
                      </Typography>

                      <Typography variant="body2" gutterBottom sx={{ color: "#27104E" }}>
                        {creatorName}
                      </Typography>

                      <Box sx={{ mt: 1, width: "100%" }}>
  <LinearProgress
    variant="determinate"
    value={
      survey.completedStudents && survey.totalStudents
        ? (survey.completedStudents / survey.totalStudents) * 100
        : 0
    }
    sx={{
      height: 6,
      borderRadius: 3,
      backgroundColor: "#E0E0E0",
      "& .MuiLinearProgress-bar": { backgroundColor: "#1FC16B" },
    }}
  />
</Box>

<Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 1 }}>
  <Typography variant="body2" sx={{ color: "#27104E", fontSize: "12px" }}>
    Progress
  </Typography>
  <Typography variant="body2" sx={{ color: "#27104E", fontSize: "12px" }}>
    {survey.completedStudents && survey.totalStudents
      ? `${Math.round((survey.completedStudents / survey.totalStudents) * 100)}%`
      : "0%"}
  </Typography>
</Box>

                      {isLive && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mt: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 12 } }}>
                              <Avatar alt="User 1" src={user1} />
                              <Avatar alt="User 2" src={user2} />
                              <Avatar alt="User 3" src={user3} />
                              <Avatar alt="User 4" src={PLUSICON} />
                            </AvatarGroup>
                            <Typography variant="body2" sx={{ color: "#E26001", fontWeight: "bold", ml: 1, fontSize: "12px" }}>
                              + responses
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        border: "1px solid",
                        borderColor: isLive ? "#E26001" : "#1FC16B",
                        borderRadius: "16px",
                        padding: "2px 8px",
                      }}>
                        <Typography variant="body2" sx={{
                          color: isLive ? "#E26001" : "#1FC16B",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          {isLive ? "In Live" : "Completed"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>

      {/* Pending List Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ 
          fontWeight: "bold", 
          color: "#27104E", 
          borderBottom: "1px solid #ddd",
          fontFamily: "Poppins, sans-serif"
        }}>
          Pending List
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            backgroundColor: "#f1f1f1", 
            borderRadius: "20px", 
            p: 1, 
            mt: 2,
            mb: 2
          }}>
            <SearchIcon sx={{ color: "gray", mx: 1 }} />
            <InputBase
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: "14px" }}
            />
          </Box>

          <RadioGroup
            value={selectedMentee}
            onChange={(e) => setSelectedMentee(e.target.value)}
          >
            {filteredMentees.map((mentee, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  p: 1.5,
                  mb: 1,
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControlLabel
                    value={mentee.email}
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif" }}>
                          {mentee.name}
                        </Typography>
                        
                      </Box>
                    }
                    sx={{ margin: 0 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: "#7B3DFF", fontFamily: "Poppins, sans-serif" }}>
                          {mentee.email}
                </Typography>
               
              </Box>
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 3 }}>
  <Typography variant="body1" sx={{ color: "#E26001", fontWeight: "bold", fontFamily: "Poppins, sans-serif" }}>
    Pending {pendingData.pending}
  </Typography>
  <Button 
    variant="contained" 
    onClick={handleNotifyAll}
    sx={{ 
      backgroundColor: "#7B3DFF", 
      color: "white", 
      textTransform: "none",
      fontFamily: "Poppins, sans-serif",
      "&:hover": { backgroundColor: "#6A30E6" }
    }}
  >
    Notify all
  </Button>
</DialogActions>
      </Dialog>

      {/* Completion Data Dialog */}
      <Dialog
  open={completionDialogOpen}
  onClose={() => setCompletionDialogOpen(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      backgroundColor: "#F5F8FE",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #ddd",
    }}
  >
    <Box>
      <Typography variant="h6">Overall Response Status</Typography>
      <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
        <Typography
          onClick={() => setActiveTab("completed")}
          sx={{
            cursor: "pointer",
            color: activeTab === "completed" ? "#7B3DFF" : "text.secondary",
            borderBottom: activeTab === "completed" ? "2px solid #7B3DFF" : "none",
            fontWeight: activeTab === "completed" ? "bold" : "normal",
          }}
        >
          Completed ({completionData.completed})
        </Typography>
        <Typography
          onClick={() => setActiveTab("pending")}
          sx={{
            cursor: "pointer",
            color: activeTab === "pending" ? "#7B3DFF" : "text.secondary",
            borderBottom: activeTab === "pending" ? "2px solid #7B3DFF" : "none",
            fontWeight: activeTab === "pending" ? "bold" : "normal",
          }}
        >
          Not Completed ({completionData.not_completed})
        </Typography>
        <Typography
          onClick={() => setActiveTab("statistics")}
          sx={{
            cursor: "pointer",
            color: activeTab === "statistics" ? "#7B3DFF" : "text.secondary",
            borderBottom: activeTab === "statistics" ? "2px solid #7B3DFF" : "none",
            fontWeight: activeTab === "statistics" ? "bold" : "normal",
          }}
        >
          Overall Statistics
        </Typography>
      </Box>
    </Box>
    <IconButton onClick={() => setCompletionDialogOpen(false)}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ pt: 3 }}>
    {activeTab === "statistics" ? (
      renderStatisticsTab()
    ) : (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            mt: 2,
            backgroundColor: "#f5f5f5",
            p: 1,
            borderRadius: 1,
            width: '60%',
          }}
        >
          <SearchIcon sx={{ mr: 1, color: "gray" }} />
          <InputBase 
            placeholder="Search..." 
            sx={{ flexGrow: 1 }} 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Survey assigned to: <strong>{completionData.assigned_to}</strong>
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          Total assigned: {completionData.total} | Completed: {completionData.completed} | Pending: {completionData.not_completed}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Name</TableCell>
                <TableCell>Roll No</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(activeTab === "completed" ? completionData.completed_students || [] : completionData.not_completed_students || [])
                .filter(student => isMatch(student))
                .map((student, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: getRandomColor(),
                          width: 32,
                          height: 32,
                          mr: 2,
                          fontSize: "0.875rem",
                        }}
                      >
                        {student.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      {student.name}
                    </TableCell>
                    <TableCell>{student.roll_no}</TableCell>
                    <TableCell>{student.role}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )}
  </DialogContent>
</Dialog>
    </Box>
  );
};

export default MentorDashboard;