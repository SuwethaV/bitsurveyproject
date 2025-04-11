

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Box, CssBaseline, IconButton, InputBase, LinearProgress, AvatarGroup,
  Avatar, Button, useMediaQuery, useTheme, Grid, Card, CardContent, Modal,
  TextField, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CreateSurveyImage from "../assets/create_survey.jpg";
import TemplateImage from "../assets/templates.png";
import CloseIcon from "@mui/icons-material/Close";
import profile1 from "../assets/profile1.jpg";
import profile2 from "../assets/profile2.jpg";
import profile3 from "../assets/profile3.jpg";
import skillImage from "../assets/image.png";
import RPImage from "../assets/rp.png";
import contactImage from "../assets/contact.png";
import user1 from "../assets/a.png";
import user2 from "../assets/m.png";
import user3 from "../assets/d.png";
import PLUSICON from "../assets/PLUS.png";
import Logo from "../assets/logo.png";
import axios from 'axios';
const desktopDrawerWidth = 220;
const primaryColor200 = "#7B3DFF";


// Helper function for avatar colors
function getRandomColor() {
  const colors = [
    '#7B61FF', '#FF6B6B', '#48BB78', '#ED8936', 
    '#4299E1', '#9F7AEA', '#F56565', '#38B2AC'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const DashboardCreated = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Live");
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [showRPInput, setShowRPInput] = useState(false);
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [students, setStudents] = useState([]);
  const [openResultsModal, setOpenResultsModal] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [draftSurveys, setDraftSurveys] = useState([]);
  const [openSurveyPopup, setOpenSurveyPopup] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [groupName, setGroupName] = useState("Untitled");
  const [surveyStats, setSurveyStats] = useState({ total: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [openResponsesModal, setOpenResponsesModal] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState({
  students: [],
  totalStudents: 0,
  completedCount: 0,
  pendingCount: 0,
  assignToRoles: ''
});
const [showSkills, setShowSkills] = useState(false);
const [activeTab, setActiveTab] = useState("completed");
const [surveyStatistics, setSurveyStatistics] = useState(null);
const fetchSurveyStatistics = async (surveyTitle) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/get-survey-statistics/${encodeURIComponent(surveyTitle)}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setSurveyStatistics(data);
  } catch (error) {
    console.error("Error fetching survey statistics:", error);
  }
};


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  
  const isMatch = (student) => {
    return (
      student.student_name.toLowerCase().includes(searchTerm) ||
      (student.student_rollno && student.student_rollno.toLowerCase().includes(searchTerm))
    );
  };
  const filteredStudents = students.filter(
    (student) =>
      (selectedYear === "All" || student.Year === selectedYear) &&
      (selectedDepartment === "All" || student.Department === selectedDepartment)
  );
//   const handleOpenResponses = async (survey) => {
//   try {
//     const token = localStorage.getItem("token");
//     const encodedSurveyTitle = encodeURIComponent(survey.survey_title);
//     const response = await fetch(
//       `http://localhost:5000/get-survey-responses/${encodedSurveyTitle}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: token,
//           'Content-Type': 'application/json'
//         },
//       }
//     );

//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.error || 'Failed to fetch survey responses');
//     }

//     setSurveyResponses(data);
//     setOpenResponsesModal(true);
//   } catch (error) {
//     console.error("Error fetching survey responses:", error);
//     alert(`Error loading survey responses: ${error.message}`);
//   }
// };
const handleOpenResponses = async (survey) => {
  try {
    const token = localStorage.getItem("token");
    const encodedSurveyTitle = encodeURIComponent(survey.survey_title);

    const [responsesResponse, statsResponse] = await Promise.all([
      fetch(`http://localhost:5000/get-survey-responses/${encodedSurveyTitle}`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }),
      fetch(`http://localhost:5000/get-survey-statistics/${encodedSurveyTitle}`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      })
    ]);

    const isJSON = (response) => {
      const contentType = response.headers.get("content-type");
      return contentType && contentType.includes("application/json");
    };

    if (!isJSON(responsesResponse)) {
      const text = await responsesResponse.text();
      throw new Error("Survey responses API did not return JSON:\n" + text);
    }

    if (!isJSON(statsResponse)) {
      const text = await statsResponse.text();
      throw new Error("Survey statistics API did not return JSON:\n" + text);
    }

    const responsesData = await responsesResponse.json();
    const statsData = await statsResponse.json();

    if (!responsesResponse.ok) {
      throw new Error(responsesData.error || "Failed to fetch survey responses");
    }

    setSurveyResponses(responsesData);
    setSurveyStatistics(statsData);
    setOpenResponsesModal(true);
  } catch (error) {
    console.error("Error fetching survey data:", error);
    alert(`Error loading survey data: ${error.message}`);
  }
};

  const handleViewDraft = (survey_id) => {
    navigate("/create-survey", { state: { draftSurveyId: survey_id } });
  };

  const categorizeSurvey = (survey) => {
    const currentDateTime = new Date();
    if (!survey.start_date || !survey.start_time || !survey.end_date || !survey.end_time) {
      console.error("❌ Missing or invalid date/time values:", survey);
      return "Invalid Data";
    }
    
    const utcDate = survey.start_date;
    const startDateISO = new Date(utcDate).toLocaleDateString('en-CA');
    const utcDate2 = survey.end_date;
    const endDateISO = new Date(utcDate2).toLocaleDateString('en-CA');

    const startTime = survey.start_time || "00:00:00";
    const endTime = survey.end_time || "23:59:59";

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString("en-GB", { hour12: false });

    if (currentDate > endDateISO) {
      return "Completed";
    }

    if (currentDate < startDateISO) {
      return "Scheduled";
    }

    if (startDateISO === endDateISO) {
      if (currentTime >= startTime && currentTime <= endTime) {
        return "Live";
      } else if (currentTime > endTime) {
        return "Completed";
      } else {
        return "Scheduled";
      }
    }

    if (currentDate >= startDateISO && currentDate <= endDateISO) {
      return "Live";
    }
    if(startDateISO===currentDate && currentTime<startTime) {
        return "Scheduled";
    }

    return { category: "Invalid Data", startDateISO: "Invalid Date" };
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Mentoring", icon: <GroupIcon />, path: "/menteedashboard" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleOpenGroupModal = () => {
    setOpenGroupModal(true);
    setShowConditions(false);
  };

  const handleCloseGroupModal = () => {
    setOpenGroupModal(false);
  };

  const handleSetConditions = () => {
    setShowConditions(true);
  };

 const handleSkillBoxClick = () => {
  setShowSkills(true);
  setShowRPInput(false);
  setShowRoleDropdown(false);
};

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
  };

  const handleLevelClick = (level) => {
    const combinedSkillLevel = `${selectedSkill} ${level}`;
    if (selectedLevels.includes(combinedSkillLevel)) {
      setSelectedLevels(selectedLevels.filter((item) => item !== combinedSkillLevel));
    } else {
      setSelectedLevels([...selectedLevels, combinedSkillLevel]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedLevels([]);
  };

  const handleRPBoxClick = () => {
    setShowRPInput(true);
    setShowSkills(false);
    setShowRoleDropdown(false);
  };

  const handleRoleBoxClick = () => {
    setShowRoleDropdown(true);
    setShowSkills(false);
    setShowRPInput(false);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleSurveyClick = (survey) => {
    const category = categorizeSurvey(survey);
    if (category === "Live") {
      setSelectedSurvey(survey);
      fetchPendingResponses(survey);
    } else if (category === "Completed") {
      handleOpenResponses(survey);
    }
  };
  const fetchPendingResponses = async (survey) => {
    try {
      const token = localStorage.getItem("token");
      const encodedSurveyTitle = encodeURIComponent(survey.survey_title);
      const response = await fetch(`http://localhost:5000/get-pending-responses/${encodedSurveyTitle}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pendingStudentsArray = Array.isArray(data.pendingStudents) 
        ? data.pendingStudents 
        : (data.pendingStudents ? [data.pendingStudents] : []);

      setPendingStudents(pendingStudentsArray);
      setSurveyStats({
        total: data.totalStudents || 0,
        completed: data.completedStudents || 0
      });
      setSelectedStudents([]);
      setOpenSurveyPopup(true);
    } catch (error) {
      console.error("Error fetching pending responses:", error);
      setPendingStudents([]);
      setSurveyStats({ total: 0, completed: 0 });
    }
  };
  const handleCloseSurveyPopup = () => {
    setOpenSurveyPopup(false);
  };

  const handleStudentSelect = (email) => {
    if (selectedStudents.includes(email)) {
      setSelectedStudents(selectedStudents.filter(e => e !== email));
    } else {
      setSelectedStudents([...selectedStudents, email]);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStudents(
        Array.isArray(pendingStudents) && pendingStudents.length > 0 
          ? pendingStudents.map(student => student.student_email) 
          : []
      );
    } else {
      setSelectedStudents([]);
    }
  };

  // const handleNotifyAll = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch('http://localhost:5000/notify-students', {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: token,
  //       },
  //       body: JSON.stringify({
  //         survey_id: selectedSurvey.id,
  //         student_emails: selectedStudents
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     alert(data.message);
  //     setOpenSurveyPopup(false);
  //   } catch (error) {
  //     console.error("Error notifying students:", error);
  //   }
  // };

  const handleNotifyAll = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
  
      const response = await fetch('http://localhost:5000/notify-students', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          survey_title: selectedSurvey.survey_title,
          student_emails: selectedStudents,
          start_date: selectedSurvey.start_date,
          end_date: selectedSurvey.end_date,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 207) {
          // Show more detailed error information
          const errorDetails = data.errors.map((e, i) => `${i+1}. ${e}`).join('\n');
          alert(`Processed with some errors:\n\n${errorDetails}\n\nSuccessfully notified ${data.successCount} students`);
        } else {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
      } else {
        alert(data.message);
      }
  
      setOpenSurveyPopup(false);
      fetchPendingResponses(selectedSurvey);
    } catch (error) {
      console.error("Error notifying students:", error);
      alert(`Error notifying students: ${error.message}`);
    }
  };
  const handleSeeResults = async () => {
    try {
      const requestBody = { selectedLevels, selectedRole, startRange, endRange };
      console.log("Sending request body:", requestBody);

      const response = await fetch('http://localhost:5000/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received from API:", data);
      setStudents(data);
      setOpenResultsModal(true);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateGroup = async () => {
    const staffemail = localStorage.getItem("staffEmail");
    if (!groupName.trim() || students.length === 0) {
      alert("Please enter a group name and select students.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/creategroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, students, staffemail }),
      });

      if (!response.ok) throw new Error("Failed to create group");

      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // const fetchSurveys = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch("http://localhost:5000/get-surveys", {
  //       method: "GET",
  //       headers: {
  //         Authorization: token,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setSurveys(data);
  //   } catch (error) {
  //     console.error("Error fetching surveys:", error);
  //   }
  // };
  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/get-surveys", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Fetch completion data for each survey
      const surveysWithCompletion = await Promise.all(data.map(async (survey)=> {
        try {
          const completionResponse = await fetch(
            `http://localhost:5000/get-survey-responses/${encodeURIComponent(survey.survey_title)}`,
            {
              method: "GET",
              headers: {
                Authorization: token,
              },
            }
          );
          
          if (completionResponse.ok) {
            const completionData = await completionResponse.json();
            return {
              ...survey,
              totalStudents: completionData.totalStudents || 0,
              completedStudents: completionData.completedCount || 0
            };
          }
          return survey;
        } catch (error) {
          console.error("Error fetching completion data:", error);
          return survey;
        }
      }));
  
      setSurveys(surveysWithCompletion);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  // const fetchCompletedSurveys = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch("http://localhost:5000/get-completed-surveys", {
  //       method: "GET",
  //       headers: {
  //         Authorization: token,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setSurveys(data);
  //   } catch (error) {
  //     console.error("Error fetching completed surveys:", error);
  //   }
  // };
  const fetchCompletedSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/get-completed-surveys", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Fetch completion data for each completed survey
      const surveysWithCompletion = await Promise.all(data.map(async (survey) => {
        try {
          const completionResponse = await fetch(
            `http://localhost:5000/get-survey-responses/${encodeURIComponent(survey.survey_title)}`,
            {
              method: "GET",
              headers: {
                Authorization: token,
              },
            }
          );
          
          if (completionResponse.ok) {
            const completionData = await completionResponse.json();
            return {
              ...survey,
              totalStudents: completionData.totalStudents || 0,
              completedStudents: completionData.completedCount || 0
            };
          }
          return survey;
        } catch (error) {
          console.error("Error fetching completion data:", error);
          return survey;
        }
      }));
  
      setSurveys(surveysWithCompletion);
    } catch (error) {
      console.error("Error fetching completed surveys:", error);
    }
  };
  const fetchScheduledSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/get-scheduled-surveys", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      console.error("Error fetching scheduled surveys:", error);
    }
  };

 
  const fetchAllSurveys = async () => {
    try {
      const token = localStorage.getItem("token");
      const [liveSurveys, completedSurveys, scheduledSurveys] = await Promise.all([
        fetch("http://localhost:5000/get-surveys", {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:5000/get-completed-surveys", {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:5000/get-scheduled-surveys", {
          method: "GET",
          headers: {
           Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
      ]);
  
      // Fetch completion data for all surveys
      const fetchCompletionData = async (survey) => {
        try {
          const response = await fetch(
            `http://localhost:5000/get-survey-responses/${encodeURIComponent(survey.survey_title)}`,
            {
              method: "GET",
              headers: {
                Authorization: token,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            return {
              ...survey,
              totalStudents: data.totalStudents || 0,
              completedStudents: data.completedCount || 0
            };
          }
          return survey;
        } catch (error) {
          console.error("Error fetching completion data:", error);
          return survey;
        }
      };
  
      // Process all surveys with completion data
      const allSurveys = [
        ...await Promise.all(liveSurveys.map(fetchCompletionData)),
        ...await Promise.all(completedSurveys.map(fetchCompletionData)),
        ...await Promise.all(scheduledSurveys.map(fetchCompletionData))
      ];
  
      // Remove duplicates (if any)
      const uniqueSurveys = allSurveys.reduce((acc, survey) => {
        if (!acc.find((s) => s.survey_title === survey.survey_title)) {
          acc.push(survey);
        }
        return acc;
      }, []);
  
      setSurveys(uniqueSurveys);
    } catch (error) {
      console.error("Error fetching all surveys:", error);
    }
  };
  const handleCloseResultsModal = () => {
    setOpenResultsModal(false);
  };

  const getLevelButtons = (skill) => {
    switch (skill) {
      case "C PROGRAMMING":
        return ["Level1", "Level2", "Level3", "Level4", "Level5", "Level6", "Level7"];
      case "PYTHON":
        return ["Level1", "Level2", "Level3", "Level4"];
      case "SQL":
        return ["Level1"];
      case "PROBLEM SOLVING":
        return ["Level1", "Level2"];
      case "JAVA":
        return ["Level1", "Level2", "Level3"];
      case "UIUX":
        return ["Level1", "Level2", "Level3"];
      case "APTITUDE":
        return ["Level1", "Level2", "Level3", "Level4", "Level5", "Level6"];
      default:
        return [];
    }
  };

  useEffect(() => {
    if (selectedOption === "Live") {
      fetchSurveys();
    } else if (selectedOption === "Completed") {
      fetchCompletedSurveys();
    } else if (selectedOption === "Scheduled") {
      fetchScheduledSurveys();
    } else if (selectedOption === "All surveys") {
      fetchAllSurveys();
    }
  }, [selectedOption]);

  const drawer = (
    <Box sx={{ height: "100vh", background: "#fff", color: "#000", p: 2 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: primaryColor200, mb: 2, fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center" }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{ width: "20px", height: "19px", marginRight: "8px" }}
        />
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
  const renderStatisticsTab = () => {
    if (!surveyStatistics) return <Typography>Loading statistics...</Typography>;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, color: "#7F56D9", fontWeight: 'bold' }}>
          Survey Statistics
        </Typography>
        
        {surveyStatistics.questions.map((question, qIndex) => (
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
                    <Typography variant="body2">{option.percentage}%</Typography>
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", fontSize: { xs: "16px", sm: "27px" } }}>
              Dashboard
            </Typography>
          </Box>

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
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                "&:hover": { boxShadow: 3 },
              }}
              onClick={() => handleNavigation("/create-survey")}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={CreateSurveyImage}
                    alt="Create Survey"
                    style={{ width: "auto", height: "70px" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Create Survey
                    <br />
                    <span style={{ fontSize: "0.875rem", color: "grey" }}>
                      Explore new paths
                    </span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                "&:hover": { boxShadow: 3 },
              }}
              onClick={() => handleNavigation("/templates")}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={TemplateImage}
                    alt="Templates"
                    style={{ width: "auto", height: "70px" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Templates
                    <br />
                    <span style={{ fontSize: "0.875rem", color: "grey" }}>
                      Create from existing
                    </span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                "&:hover": { boxShadow: 3 },
              }}
              onClick={handleOpenGroupModal}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={CreateSurveyImage}
                    alt="Create Groups"
                    style={{ width: "auto", height: "70px" }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Create Groups
                    <br />
                    <span style={{ fontSize: "0.875rem", color: "grey" }}>
                      Add members
                    </span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
          {["Live", "Scheduled", "All surveys", "Completed"].map((option) => (
            <Button
              key={option}
              onClick={() => handleOptionClick(option)}
              disableRipple
              sx={{
                textTransform: "none",
                color: selectedOption === option ? primaryColor200 : "text.secondary",
                borderBottom: selectedOption === option ? `2px solid ${primaryColor200}` : "none",
                borderRadius: 0,
                padding: 0,
                minWidth: "auto",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "transparent",
                },
                "&:active": {
                  backgroundColor: "transparent",
                },
                "&:focus": {
                  outline: "none",
                },
                "&:focus-visible": {
                  outline: "none",
                },
              }}
            >
              {option}
            </Button>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          {(selectedOption === "Live" || selectedOption === "Completed" || selectedOption === "Scheduled" || selectedOption === "All surveys") && (
            <Grid container spacing={2}>
            {surveys.map((survey, index) => {
              const startDateISO = new Date(survey.start_date).toLocaleDateString('en-CA');
              const surveyCategory = categorizeSurvey(survey);
              const isCompletedSurvey = surveyCategory === "Completed";
              
              // Calculate completion percentage
              const completionPercentage = survey.completedStudents && survey.totalStudents
                ? Math.round((survey.completedStudents / survey.totalStudents) * 100)
                : 0;
          
              // For completed surveys, we want to show 100% if all students completed
              // or the actual completion percentage if some didn't complete
              const displayPercentage = isCompletedSurvey 
                ? Math.min(100, completionPercentage) // Ensure we don't show >100%
                : completionPercentage;
          
              return (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    sx={{
                      backgroundColor: "#F5F8FE",
                      cursor: "pointer",
                      "&:hover": { boxShadow: 3 },
                      borderRadius: "10px",
                      position: "relative",
                    }}
                    onClick={() => handleSurveyClick(survey)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "16px", color: "#4A4A4A" }}>
                        {startDateISO}
                      </Typography>
          
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "14px", color: "#27104E", fontWeight: 600 }}>
                        {survey.survey_title}
                      </Typography>
          
                      <Typography variant="h6" gutterBottom sx={{ fontSize: "16px", color: "#27104E" }}>
                        {survey.staff_email.split(".")[0].toUpperCase()}
                      </Typography>
          
                      <Box sx={{ mt: 1, width: "100%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={displayPercentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#E0E0E0",
                            "& .MuiLinearProgress-bar": { 
                              backgroundColor: isCompletedSurvey ? "#1FC16B" : "#1FC16B" 
                            },
                          }}
                        />
                      </Box>
          
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mt: 1 }}>
                        <Typography variant="body2" sx={{ color: "#27104E", fontSize: "12px" }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#27104E", fontSize: "12px" }}>
                          {displayPercentage}%
                        </Typography>
                      </Box>
          
                      {isCompletedSurvey && <br />}
                      {(categorizeSurvey(survey)==="Scehduled") && <br />}
          
                      {surveyCategory === "Live" && (
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
                    </CardContent>
          
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        border: "1px solid",
                        borderColor: surveyCategory === "Live" ? "#E26001" : surveyCategory === "Completed" ? "#1FC16B" : "#C13B06",
                        borderRadius: "16px",
                        padding: "2px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "transparent",
                        minWidth: "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#5A5A5A",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {surveyCategory === "Live" ? "In Live" : surveyCategory}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          )}

          {selectedOption === "Group surveys" && <Typography>Group surveys will be displayed here.</Typography>}
        </Box>
      </Box>

      {/* Group Creation Modal */}
      <Modal
        open={openGroupModal}
        onClose={handleCloseGroupModal}
        aria-labelledby="group-creation-modal"
        aria-describedby="group-creation-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "8px",
          width: "650px",
          height: "530px",
          textAlign: "left",
          position: "relative",
        }}>
          <IconButton
            onClick={handleCloseGroupModal}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "red",
            }}
          >
            <CloseIcon />
          </IconButton>

          {!showConditions ? (
            <>
              <Typography
                id="group-creation-modal"
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  marginLeft: "10px",
                }}
              >
                Group creation
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  width: "100%",
                  height: "80px",
                  marginTop: "20px",
                }}
              >
                <Box
                  sx={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "absolute",
                    left: "30%",
                    zIndex: 1,
                    border: "2px solid white",
                  }}
                >
                  <img
                    src={profile1}
                    alt="Profile 1"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                <Box
                  sx={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    border: "2px solid white",
                  }}
                >
                  <img
                    src={profile2}
                    alt="Profile 2"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                <Box
                  sx={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "absolute",
                    right: "30%",
                    zIndex: 1,
                    border: "2px solid white",
                  }}
                >
                  <img
                    src={profile3}
                    alt="Profile 3"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </Box>

              <Typography sx={{ mt: 10, textAlign: "center", color: "grey" }}>
                You wanna create a new group! Add members to <br />contribute to your survey.
              </Typography>

              <Box sx={{ mt: 4, ml: 28 }}>
                <Button
                  variant="contained"
                  onClick={handleSetConditions}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#7B61FF",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    height: "32px",
                  }}
                >
                  Set Conditions
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography
                id="group-creation-modal"
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  marginLeft: "10px",
                }}
              >
                Set Conditions
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  ml: "10px",
                }}
              >
                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    textAlign: "center",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={handleSkillBoxClick}
                >
                  <img
                    src={skillImage}
                    alt="Skill"
                    style={{ width: "30px", height: "30px", borderRadius: "50%" }}
                  />
                  <Typography>Skill</Typography>
                </Box>

                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    textAlign: "center",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={handleRPBoxClick}
                >
                  <img
                    src={RPImage}
                    alt="RP"
                    style={{ width: "40px", height: "28px", borderRadius: "50%" }}
                  />
                  <Typography>RP</Typography>
                </Box>

                <Box
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    textAlign: "center",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                  onClick={handleRoleBoxClick}
                >
                  <img
                    src={contactImage}
                    alt="Role"
                    style={{ width: "40px", height: "30px", borderRadius: "50%" }}
                  />
                  <Typography>Role</Typography>
                </Box>
              </Box>

              {showSkills && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 2,
                    ml: "10px",
                  }}
                >
                  {["C PROGRAMMING", "PYTHON", "SQL", "PROBLEM SOLVING", "JAVA", "UIUX", "APTITUDE"].map((skill, index) => (
                    <Button
                      key={index}
                      variant="contained"
                      onClick={() => handleSkillClick(skill)}
                      sx={{
                        textTransform: "none",
                        backgroundColor: selectedSkill === skill ? "#6A50E0" : "rgb(226, 222, 248)",
                        color: selectedSkill === skill ? "white" : "black",
                        borderRadius: "20px",
                        border: "2px solid #6A50E0",
                        padding: "2px 8px",
                        fontSize: "0.7rem",
                        height: "24px",
                        "&:hover": {
                          backgroundColor: "#6A50E0",
                          borderColor: "#6A50E0",
                        },
                      }}
                    >
                      {skill}
                    </Button>
                  ))}
                </Box>
              )}

              {selectedSkill && showSkills && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 2,
                    ml: "10px",
                  }}
                >
                  {getLevelButtons(selectedSkill).map((level, index) => (
                    <Button
                      key={index}
                      variant="contained"
                      onClick={() => handleLevelClick(level)}
                      sx={{
                        textTransform: "none",
                        backgroundColor: selectedLevels.includes(`${selectedSkill} ${level}`) ? "#6A50E0" : "rgb(226, 222, 248)",
                        color: selectedLevels.includes(`${selectedSkill} ${level}`) ? "white" : "black",
                        borderRadius: "20px",
                        border: "2px solid #6A50E0",
                        padding: "2px 8px",
                        fontSize: "0.7rem",
                        height: "24px",
                        "&:hover": {
                          backgroundColor: "#6A50E0",
                          borderColor: "#6A50E0",
                        },
                      }}
                    >
                      {level}
                    </Button>
                  ))}
                </Box>
              )}

              {showRPInput && (
                <Box
                  sx={{
                    mt: 2,
                    ml: "10px",
                    display: "flex",
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Start Range"
                    variant="outlined"
                    value={startRange}
                    onChange={(e) => setStartRange(e.target.value)}
                    sx={{ width: "150px" }}
                  />
                  <TextField
                    label="End Range"
                    variant="outlined"
                    value={endRange}
                    onChange={(e) => setEndRange(e.target.value)}
                    sx={{ width: "150px" }}
                  />
                </Box>
              )}

              {showRoleDropdown && (
                <Box
                  sx={{
                    mt: 2,
                    ml: "10px",
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel id="role-select-label">Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      id="role-select"
                      value={selectedRole}
                      label="Role"
                      onChange={handleRoleChange}
                      sx={{ width: "200px" }}
                    >
                      <MenuItem value="Faculty">Faculty</MenuItem>
                      <MenuItem value="Student">Student</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {selectedLevels.length > 0 && showSkills && (
                <Box
                  sx={{
                    mt: 2,
                    ml: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "16px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {selectedLevels.map((level, index) => (
                      <Button
                        key={index}
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          backgroundColor: "rgb(226, 222, 248)",
                          color: "black",
                          borderRadius: "20px",
                          border: "2px solid #6A50E0",
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          height: "24px",
                          "&:hover": {
                            backgroundColor: "#6A50E0",
                            borderColor: "#6A50E0",
                          },
                        }}
                      >
                        {level}
                      </Button>
                    ))}
                  </Box>
                  <Button
                    onClick={handleDeselectAll}
                    sx={{
                      mt: 2,
                      textTransform: "none",
                      color: "red",
                      fontSize: "0.7rem",
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    Deselect All
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 2, ml: 52 }}>
                <Button
                  variant="contained"
                  onClick={handleSeeResults}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#7B61FF",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    height: "32px",
                  }}
                >
                  See Results
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Results Modal */}
      <Modal
        open={openResultsModal}
        onClose={handleCloseResultsModal}
        aria-labelledby="results-modal"
        aria-describedby="results-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            padding: "40px",
            borderRadius: "8px",
            width: "80%",
            maxWidth: "1200px",
            height: "80%",
            overflowY: "auto",
            textAlign: "left",
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleCloseResultsModal}
            sx={{ position: "absolute", top: "10px", right: "10px", color: "red" }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            Student Results
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="I">I</MenuItem>
                <MenuItem value="II">II</MenuItem>
                <MenuItem value="III">III</MenuItem>
                <MenuItem value="IV">IV</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="ECE">ECE</MenuItem>
                <MenuItem value="MECH">MECH</MenuItem>
                <MenuItem value="CIVIL">CIVIL</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              variant="outlined"
              sx={{ flexGrow: 1 }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ bgcolor: "#1976d2", color: "white" }}>
                        {student.Name.charAt(0).toUpperCase()}
                      </Avatar>
                      {student.Name}
                    </TableCell>
                    <TableCell>{student.Year}</TableCell>
                    <TableCell>{student.Email}</TableCell>
                    <TableCell>{student.Department}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button variant="contained" color="primary" onClick={handleCreateGroup} sx={{ marginTop: 2 }}>
            Create Groups
          </Button>
        </Box>
      </Modal>

      {/* Survey Pending Responses Popup */}
      <Dialog
  open={openSurveyPopup}
  onClose={handleCloseSurveyPopup}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#F5F8FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    Pending list
    <IconButton onClick={handleCloseSurveyPopup} sx={{ color: 'red' }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
      <SearchIcon sx={{ mr: 1, color: 'gray' }} />
      <InputBase 
        placeholder="Search..." 
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          padding: '4px 8px',
          flexGrow: 1
        }} 
      />
    </Box>
    
    <Typography variant="body2" sx={{ mb: 2 }}>
      Survey: {selectedSurvey?.survey_title}
    </Typography>
    
    <Typography variant="body2" sx={{ mb: 2 }}>
      Total assigned: {surveyStats.total} | Completed: {surveyStats.completed} 
    </Typography>
    
    <Box sx={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedStudents.length === pendingStudents.length && pendingStudents.length > 0}
            indeterminate={selectedStudents.length > 0 && selectedStudents.length < pendingStudents.length}
            onChange={handleSelectAll}
          />
        }
        label="Select all"
        sx={{ ml: 1, mt: 1 }}
      />
      
      <List>
        {pendingStudents
          .filter(isMatch)
          .map((student, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <Checkbox
                  edge="start"
                  checked={selectedStudents.includes(student.student_email)}
                  onChange={() => handleStudentSelect(student.student_email)}
                  tabIndex={-1}
                  disableRipple
                />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#7B61FF', 
                    mr: 2,
                    fontSize: '0.875rem'
                  }}>
                    {student.student_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="body1"
                      sx={{
                        backgroundColor: student.student_name.toLowerCase().includes(searchTerm) && searchTerm ? '#fffbcc' : 'transparent'
                      }}
                    >
                      {student.student_name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#7B61FF',
                        backgroundColor: student.student_rollno?.toLowerCase().includes(searchTerm) && searchTerm ? '#fffbcc' : 'transparent'
                      }}
                    >
                      {student.student_rollno || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Box>
  </DialogContent>
  <DialogActions sx={{ 
    justifyContent: 'space-between', 
    p: 2,
    borderTop: '1px solid #eee'
  }}>
    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
      Pending {pendingStudents.filter(isMatch).length}
    </Typography>
    <Button 
      variant="contained" 
      onClick={handleNotifyAll}
      disabled={selectedStudents.length === 0}
      sx={{ 
        backgroundColor: '#7B61FF',
        '&:hover': {
          backgroundColor: '#6A50E0'
        }
      }}
    >
      Notify all
    </Button>
  </DialogActions>
</Dialog>


<Dialog
        open={openResponsesModal}
        onClose={() => setOpenResponsesModal(false)}
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
                Completed ({surveyResponses.completedCount})
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
                Not Completed ({surveyResponses.pendingCount})
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
          <IconButton onClick={() => setOpenResponsesModal(false)}>
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
                Survey assigned to: <strong>{surveyResponses.assignToRoles}</strong>
              </Typography>

              <Typography variant="body2" sx={{ mb: 3 }}>
                Total assigned: {surveyResponses.totalStudents} | Completed: {surveyResponses.completedCount} | Pending: {surveyResponses.pendingCount}
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
                    {surveyResponses.students
                      .filter((student) => (activeTab === "completed" ? student.status === "completed" : student.status === "pending"))
                      .filter((student) => isMatch({
                          student_name: student.name,
                          student_rollno: student.rollno
                      }))
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
                              {student.name.charAt(0).toUpperCase()}
                            </Avatar>
                            {student.name}
                          </TableCell>
                          <TableCell>{student.rollno}</TableCell>
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

export default DashboardCreated;

