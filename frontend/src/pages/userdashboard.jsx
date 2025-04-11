import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  Button,
  Badge,
  Popover,
  Paper,
  ListItemAvatar,
  Chip,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Highlight Component
const Highlight = ({ text, searchQuery }) => {
  if (!searchQuery) return <span>{text}</span>;

  const regex = new RegExp(`(${searchQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: "yellow" }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const User = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [liveSurveys, setLiveSurveys] = useState([]);
  const [userInitial, setUserInitial] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/get-notifications", {
        headers: { Authorization: token },
      });
      setNotifications(response.data);
      fetchNotificationCount();
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/notification-count", {
        headers: { Authorization: token },
      });
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/mark-notification-read",
        { notificationId },
        { headers: { Authorization: token } }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    if (tabIndex === 0) {
      fetchLiveSurveys();
    }
    fetchNotificationCount();
  }, [tabIndex]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = jwtDecode(token);
      const userName = user.name || user.email;
      if (userName) {
        setUserInitial(userName.charAt(0).toUpperCase());
      }
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const fetchLiveSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = jwtDecode(token);
      const studentEmail = user.email;

      const response = await axios.get("http://localhost:5000/surveysuser", {
        headers: { Authorization: token },
      });

      if (response.status === 200) {
        const now = new Date();
        // Only show surveys that are currently live (started but not ended)
        const live = response.data.filter(
          survey => new Date(survey.start_date) <= now && new Date(survey.end_date) >= now
        );
        // Completed surveys are those that have ended
        const completed = response.data.filter(
          survey => new Date(survey.end_date) < now
        );

        const surveysWithCounts = await Promise.all(
          live.map(async (survey) => {
            const countResponse = await axios.get("http://localhost:5000/submission-count", {
              headers: { Authorization: token },
              params: {
                survey_title: survey.survey_title,
                student_email: studentEmail,
              }
            });
           
            // New code to fetch and insert student emails into survey_students table
            try {
              const permissionsResponse = await axios.get(`http://localhost:5000/get-survey-permissions`, {
                params: { survey_title: survey.survey_title },
                headers: { Authorization: token }
              });

              const permissions = permissionsResponse.data;
              if (permissions.length > 0) {
                const assignedRoles = permissions[0].assigned_roles;
                let students = [];

                if (assignedRoles.includes('Year:') || assignedRoles.includes('Department:')) {
                  // Handle year and department cases
                  const yearMatch = assignedRoles.match(/Year:([^ ]+)/);
                  const deptMatch = assignedRoles.match(/Department:([^ ]+)/);

                  const year = yearMatch ? yearMatch[1] : null;
                  const department = deptMatch ? deptMatch[1] : null;

                  const studentsResponse = await axios.get('http://localhost:5000/get-students-by-criteria', {
                    params: { year, department },
                    headers: { Authorization: token }
                  });
                  students = studentsResponse.data;
                } else {
                  // Handle group case
                  const groupName = assignedRoles.replace('Group:', '');
                  const groupInfoResponse = await axios.get('http://localhost:5000/get-group-info', {
                    params: { groupName },
                    headers: { Authorization: token }
                  });

                  if (groupInfoResponse.data.length > 0) {
                    const groupId = groupInfoResponse.data[0].GroupID;
                    const groupStudentsResponse = await axios.get('http://localhost:5000/get-group-students', {
                      params: { groupId },
                      headers: { Authorization: token }
                    });
                    students = groupStudentsResponse.data;
                  }
                }

                // Insert students into survey_students table
                if (students.length > 0) {
                  await axios.post('http://localhost:5000/insert-survey-students', {
                    survey_title: survey.survey_title,
                    start_date: survey.start_date,
                    end_date: survey.end_date,
                    students: students.map(s => s.Email)
                  }, {
                    headers: { Authorization: token }
                  });
                }
              }
            } catch (err) {
              console.error('Error processing survey permissions:', err);
            }

            return {
              ...survey,
              submissionCount: countResponse.data.count,
              responseLimit: survey.response_limit
            };
          })
        );

        setLiveSurveys(surveysWithCounts);
        // Only show completed surveys (no future surveys)
        setCompletedSurveys(completed);
      }
    } catch (error) {
      console.error("Error fetching live surveys:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const open = Boolean(anchorEl);

  const Sidebar = () => {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? 240 : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": { 
            width: sidebarOpen ? 240 : 60, 
            transition: "0.3s ease-in-out",
            boxSizing: "border-box"
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: sidebarOpen ? "space-between" : "center", p: 2 }}>
          {sidebarOpen && <Typography sx={{ color: "#6A5ACD", fontWeight: "bold", fontSize: "1.2rem" }}>BIT SURVEY</Typography>}
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Dashboard" />}
          </ListItem>
        </List>
        <Box sx={{ position: "absolute", bottom: 0, width: "100%" }}>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="Log out" />}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflow: "auto", bgcolor: "white" }}>
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{
            bgcolor: "white",
            width: `calc(100% - ${sidebarOpen ? 240 : 60}px)`,
            ml: sidebarOpen ? `${240}px` : `${60}px`,
            transition: "0.3s ease-in-out",
          }}
        >
          <Toolbar sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            flexDirection: isMobile && mobileSearchOpen ? "column" : "row",
            alignItems: isMobile && mobileSearchOpen ? "flex-start" : "center",
            py: isMobile && mobileSearchOpen ? 1 : 0,
            gap: isMobile ? 1 : 2
          }}>
            {!isMobile && (
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Dashboard
              </Typography>
            )}
            
            {isMobile && !mobileSearchOpen && (
              <Typography variant="h6" sx={{ fontWeight: "bold", flexGrow: 1 }}>
                Dashboard
              </Typography>
            )}

            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 2,
              width: isMobile && mobileSearchOpen ? "100%" : "auto",
              mt: isMobile && mobileSearchOpen ? 1 : 0
            }}>
              {isMobile && !mobileSearchOpen ? (
                <IconButton onClick={() => setMobileSearchOpen(true)}>
                  <SearchIcon />
                </IconButton>
              ) : (
                <TextField
                  variant="outlined"
                  placeholder="Search..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    width: isMobile ? "100%" : 200,
                    backgroundColor: "#F5F8FE",
                    borderRadius: "20px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                    },
                  }}
                  InputProps={{
                    endAdornment: isMobile && (
                      <IconButton onClick={() => setMobileSearchOpen(false)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              )}

              {(!isMobile || !mobileSearchOpen) && (
                <>
                  <IconButton 
                    sx={{ backgroundColor: "#F5F6FA", p: 1 }}
                    onClick={handleNotificationClick}
                  >
                    <Badge badgeContent={notificationCount} color="error">
                      <NotificationsIcon sx={{ color: "#7A7A7A", fontSize: { xs: "10px", sm: "24px" } }} />
                    </Badge>
                  </IconButton>
                  <Popover
  open={open}
  anchorEl={anchorEl}
  onClose={handleNotificationClose}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "right",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
  sx={{
    mt: 1,
    "& .MuiPaper-root": {
      width: isMobile ? "90vw" : 400,
      maxHeight: 400,
      overflow: "auto",
      p: 2,
    },
  }}
>
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
      Notifications
    </Typography>
    <IconButton size="small" onClick={handleNotificationClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
  <Divider />
  {notifications.length === 0 ? (
    <Typography sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
      No new notifications
    </Typography>
  ) : (
// Update the notification rendering part in your User component
// Update the notification rendering part in your User component
<List>
  {notifications.map((notification) => (
    <ListItem 
      key={notification.id} 
      sx={{ 
        "&:hover": { backgroundColor: "#F5F8FE" },
        cursor: "pointer",
        borderRadius: 1,
        mb: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
      }}
    >
      <Box sx={{ 
        display: "flex", 
        width: "100%",
        alignItems: "center"
      }}>
        <Box sx={{ 
          position: "relative",
          mr: 2,
          display: "flex",
          alignItems: "center"
        }}>
          <Avatar sx={{ 
            bgcolor: "#6A5ACD", 
            width: 32, 
            height: 32,
            mr: 2
          }}>
            {notification.survey_title.charAt(0).toUpperCase()}
          </Avatar>
          {notification.mark_read === 0 && (
            <Box sx={{
              position: "absolute",
              top: 0,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#1FC16B"
            }} />
          )}
        </Box>
        <ListItemText
          primary={
            notification.is_last_day 
              ? `Last day to attend: ${notification.survey_title}`
              : notification.staff_notified
                ? `You were asked to attend: ${notification.survey_title}`
                : `New Survey: ${notification.survey_title}`
          }
          secondary={
            notification.is_last_day
              ? `Today is the last day to attend this survey!`
              : `Active from ${new Date(notification.start_date).toLocaleDateString()} to ${new Date(notification.end_date).toLocaleDateString()}`
          }
          primaryTypographyProps={{ 
            fontWeight: "medium",
            color: notification.is_last_day ? "#B42318" : "inherit"
          }}
          onClick={() => {
            markNotificationAsRead(notification.id);
            navigate(`/surveyquestions/${notification.survey_title}`);
            handleNotificationClose();
          }}
        />
      </Box>
      <Box sx={{ 
        display: "flex", 
        width: "100%",
        justifyContent: "flex-end",
        mt: 1,
        gap: 1
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: "#1FC16B",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" }
          }}
          onClick={async (e) => {
            e.stopPropagation();
            await markNotificationAsRead(notification.id);
            fetchNotifications();
            fetchNotificationCount();
          }}
        >
          {notification.mark_read === 1 ? 'Mark as unread' : 'Mark as read'}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: "#B42318",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" }
          }}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const token = localStorage.getItem("token");
              await axios.put("http://localhost:3000/delete-notification", 
                { notificationId: notification.id },
                { headers: { Authorization: token } }
              );
              fetchNotifications();
              fetchNotificationCount();
            } catch (error) {
              console.error("Error marking notification as deleted:", error);
            }
          }}
        >
          Delete
        </Typography>
      </Box>
    </ListItem>
  ))}
</List>

  )}
</Popover>
                  <Avatar
                    sx={{ cursor: "pointer", bgcolor: "#6A5ACD" }}
                    onClick={() => navigate("/user-details")}
                  >
                    {userInitial}
                  </Avatar>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        

        <Box sx={{ mt: 8, p: isMobile ? 1 : 3 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ mb: 3 }}
            TabIndicatorProps={{
              style: { backgroundColor: "#7F56D9" },
            }}
          >
            <Tab
              label="Live"
              sx={{
                color: tabIndex === 0 ? "#7F56D9" : "inherit",
                "&.Mui-selected": { color: "#7F56D9" },
                "&:focus": { outline: "none" },
              }}
            />
            <Tab
              label="Completed"
              sx={{
                color: tabIndex === 1 ? "#7F56D9" : "inherit",
                "&.Mui-selected": { color: "#7F56D9" },
                "&:focus": { outline: "none" },
              }}
            />
          </Tabs>

          {tabIndex === 0 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Live Surveys
              </Typography>
              <Grid container spacing={3}>
                {liveSurveys.map((survey, index) => {
                  const startDate = new Date(survey.start_date);
                  const endDate = new Date(survey.end_date);
                  const currentDate = new Date();
                  const timeDifference = endDate - currentDate;
                  const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                  const hoursLeft = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

                  const isLive = currentDate >= startDate && currentDate <= endDate;
                  const statusColor = isLive ? "#B42318" : "#808080";
                  const statusBgColor = isLive ? "#FEF3F2" : "#F0F0F0";
                  const canResubmit = survey.submissionCount < survey.responseLimit;
                  const isDisabled = survey.submissionCount >= survey.responseLimit;

                  return (
                    <Grid item xs={12} md={4} key={index}>
                      <Card sx={{ 
                        bgcolor: "#F5F8FE", 
                        height: "100%", 
                        display: "flex", 
                        flexDirection: "column",
                        position: "relative",
                        minHeight: "250px"
                      }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: "bold",
                              fontSize: "14px",
                              color: statusColor,
                              backgroundColor: statusBgColor,
                              borderRadius: "20px",
                              padding: "4px 12px",
                              display: "inline-block",
                              textAlign: "center",
                              mb: 1,
                            }}
                          >
                            {isLive
                              ? `Live: ${daysLeft}d ${hoursLeft}h ${minutesLeft}m left`
                              : `Expired`}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#27104E", fontSize: "14px", fontWeight: "bold" }}>
                            <Highlight text={survey.survey_title} searchQuery={searchQuery} />
                          </Typography>
                          <Typography color="textSecondary" sx={{ mt: 1 }}>
                            Start Date: {startDate.toLocaleString()}
                          </Typography>
                          <Typography color="textSecondary" sx={{ mt: 1 }}>
                            End Date: {endDate.toLocaleString()}
                          </Typography>
                          <Typography color="textSecondary" sx={{ mt: 1 }}>
                            Submissions: {survey.submissionCount}/{survey.responseLimit}
                          </Typography>
                        </CardContent>
                        <Box sx={{
                          position: "absolute",
                          bottom: 16,
                          right: 16
                        }}>
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: isDisabled ? "#808080" : "#1FC16B",
                              color: "white",
                              "&:hover": { backgroundColor: isDisabled ? "#808080" : "#1FC16B" },
                            }}
                            onClick={() => {
                              if (isDisabled) {
                                alert('You have reached the maximum submission limit. To edit your response, please contact the survey creator.');
                              } else {
                                navigate(`/surveyquestions/${survey.survey_title}`, { 
                                  state: { 
                                    canResubmit,
                                    submissionCount: survey.submissionCount 
                                  } 
                                });
                              }
                            }}
                            disabled={isDisabled}
                          >
                            {survey.submissionCount === 0 ? 'Start' : 
                             canResubmit ? 'Resubmit' : 'Already Submitted'}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {tabIndex === 1 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Completed Surveys
              </Typography>
              <Grid container spacing={3}>
                {completedSurveys.map((survey, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        bgcolor: "#F5F8FE",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        minHeight: "250px"
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            color: "#808080",
                            backgroundColor: "#F0F0F0",
                            borderRadius: "20px",
                            padding: "4px 12px",
                            display: "inline-block",
                            textAlign: "center",
                            mb: 1,
                            border: "2px solid #1FC16B",
                          }}
                        >
                          Completed
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#27104E", fontSize: "14px", fontWeight: "bold" }}>
                          <Highlight text={survey.survey_title} searchQuery={searchQuery} />
                        </Typography>
                        <Typography color="textSecondary" sx={{ mt: 1 }}>
                          Start Date: {new Date(survey.start_date).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" sx={{ mt: 1 }}>
                          End Date: {new Date(survey.end_date).toLocaleString()}
                        </Typography>
                      </CardContent>
                      <Box sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16
                      }}>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#1FC16B",
                            color: "white",
                            "&:hover": { backgroundColor: "#1FC16B" },
                          }}
                          onClick={() => {
                            console.log("View Survey:", survey.survey_id);
                          }}
                        >
                          View
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
export default User;