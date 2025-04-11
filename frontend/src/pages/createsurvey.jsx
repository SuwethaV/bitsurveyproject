import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  TextField,
  Button,
  Select,
  Divider,
  Typography,
  MenuItem,
  IconButton,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  Box,
  Menu,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Settings,
  Notifications,
  AddCircleOutline,
  RemoveCircleOutline,
  ContentCopy,
  Edit,
  Delete,
  PlaylistAdd,
} from "@mui/icons-material";

const SurveyCreation = () => {
  const location = useLocation();
  const { draftSurveyId } = location.state || {};
  const [surveyId, setSurveyId] = useState(uuidv4());
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "",
      type: "multiple",
      options: ["Agree", "Disagree", "Strongly disagree"],
      scale: 3,
      expanded: false,
      showOptions: false,
      require_answer: false,
      shuffle_answers: false,
      shuffle_questions: false,
      skip_based_on_answer: false,
      score_question: false,
      add_other_option: false,
    },
  ]);
  const [surveyTitle, setSurveyTitle] = useState("Untitled");

  useEffect(() => {
    if (draftSurveyId) {
      fetchDraftSurvey(draftSurveyId);
    }
  }, [draftSurveyId]);

  const fetchDraftSurvey = async (survey_id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/get-draft-survey/${survey_id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSurveyTitle(data.survey_name);
      setQuestions(
        data.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          scale: 3,
          expanded: false,
          showOptions: false,
          require_answer: q.require_answer,
          shuffle_answers: q.shuffle_answers,
          shuffle_questions: q.shuffle_questions,
          skip_based_on_answer: q.skip_based_on_answer,
          score_question: q.score_question,
          add_other_option: q.add_other_option,
        }))
      );
    } catch (error) {
      console.error("Error fetching draft survey:", error);
    }
  };

  const [groups, setGroups] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [hideAnswers, setHideAnswers] = useState(false);

  const [dateTimeAllocationChecked, setDateTimeAllocationChecked] = useState(false);
  const [schedulingFrequencyChecked, setSchedulingFrequencyChecked] = useState(false);
  const [randomTimingChecked, setRandomTimingChecked] = useState(false);
  const [weeklyChecked, setWeeklyChecked] = useState(false);
  const [assignRolesChecked, setAssignRolesChecked] = useState(false);
  const [setResponseLimitChecked, setSetResponseLimitChecked] = useState(false);




  const [editingOption, setEditingOption] = useState({ qIndex: null, oIndex: null });
  const [activePage, setActivePage] = useState("edit");

  const [permissionData, setPermissionData] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    schedulingFrequency: [],
    daysOfWeek: [],
    randomTiming: false,
    timeDifference: 0,
    sendReminders: true,
    assignedRoles: "",
    responseLimit: 1,
    survey_id: "",
    surveyTitle: "",
  });

  const [yearAnchorEl, setYearAnchorEl] = useState(null);
  const [departmentAnchorEl, setDepartmentAnchorEl] = useState(null);

  const [groupsPopupOpen, setGroupsPopupOpen] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const handleExpand = (index) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, expanded: true } : q)));
  };

  const handleAddOption = (index) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, options: [...q.options, "New Option"] } : q))
    );
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.filter((_, j) => j !== oIndex) } : q
      )
    );
  };

  // const handleAddQuestion = () => {
  //   setQuestions((prev) => [
  //     ...prev,
  //     {
  //       id: prev.length + 1,
  //       text: "",
  //       type: "multiple",
  //       options: ["Agree", "Disagree", "Strongly disagree"],
  //       scale: 3,
  //       expanded: false,
  //       showOptions: false,
  //       require_answer: false,
  //       shuffle_answers: false,
  //       shuffle_questions: false,
  //       skip_based_on_answer: false,
  //       score_question: false,
  //       add_other_option: false,
  //     },
  //   ]);
  // };
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: "",
        type: "multiple", // Default type is "multiple"
        options: ["Agree", "Disagree", "Strongly disagree"], // Always include these for multiple choice
        scale: 3,
        expanded: false,
        showOptions: false,
        require_answer: false,
        shuffle_answers: false,
        shuffle_questions: false,
        skip_based_on_answer: false,
        score_question: false,
        add_other_option: false,
      },
    ]);
  };
  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyQuestion = (index) => {
    setQuestions((prev) => {
      const newQuestion = { ...prev[index], id: prev.length + 1 };
      return [...prev, newQuestion];
    });
  };

  const handleFinishSurvey = async (isDraft = false) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        survey_id: surveyId,
        questions: questions,
        surveyTitle,
        draft: isDraft ? "draft" : null,
      };

      console.log("Payload before sending:", payload);

      const response = await axios.post(
        "http://localhost:5000/save-survey",
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        const survey_id = response.data.survey_id;
        setPermissionData((prev) => ({ ...prev, survey_id, surveyTitle }));
        setOpenDialog(true);
        alert(isDraft ? "Survey saved as draft!" : "Survey saved successfully!");
      }
    } catch (error) {
      console.error("Error saving survey:", error);
      alert("Failed to save survey.");
    }
  };

  const handleSaveBulkOptions = () => {
    const newOptions = bulkText.split("\n").filter((line) => line.trim() !== "");
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === activeQuestionIndex ? { ...q, options: [...q.options, ...newOptions] } : q
      )
    );
    setBulkDialogOpen(false);
    setBulkText("");
  };

  const handleAddParsedQuestions = () => {
    const questionBlocks = inputText.split("\n\n");
    const parsedQuestions = questionBlocks.map((block, index) => {
      const lines = block.split("\n");
      const question = lines[0];
      const choices = lines.slice(1);
      return {
        id: questions.length + index + 1,
        text: question,
        type: "multiple",
        options: choices,
        scale: 3,
        expanded: false,
        showOptions: false,
        require_answer: false,
        shuffle_answers: false,
        shuffle_questions: false,
        skip_based_on_answer: false,
        score_question: false,
        add_other_option: false,
      };
    });
    setQuestions((prev) => [...prev, ...parsedQuestions]);
    setModalOpen(false);
    setInputText("");
  };

  const handleToggleOptions = (index) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, showOptions: !q.showOptions } : q)));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((option, j) => (j === oIndex ? value : option)),
            }
          : q
      )
    );
  };

  const handleEditOption = (qIndex, oIndex) => {
    setEditingOption({ qIndex, oIndex });
  };

  const handleSaveEditedOption = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((option, j) => (j === oIndex ? value : option)),
            }
          : q
      )
    );
    setEditingOption({ qIndex: null, oIndex: null });
  };

  const handleSurveyTitleChange = (e) => {
    setSurveyTitle(e.target.value);
    setPermissionData((prev) => ({ ...prev, surveyTitle: e.target.value }));
  };

  const handlePermissionDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "weekly") {
      setWeeklyChecked(checked);
    }
    setPermissionData({
      ...permissionData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePermissionData = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "assignedRoles") {
      if (value === "Year") {
        setShowYearDropdown(true);
        setShowDepartmentDropdown(false);
        setPermissionData((prev) => ({ ...prev, assignedRoles: "" }));
      } else if (value === "Department") {
        setShowDepartmentDropdown(true);
        setShowYearDropdown(false);
        setPermissionData((prev) => ({ ...prev, assignedRoles: "" }));
      } else if (value === "Group") {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:5000/get-faculty-groups", {
            headers: {
              Authorization: token,
            },
          });

          if (response.status === 200) {
            setGroups(response.data);
            setGroupsPopupOpen(true); // Open the popup to display groups
          }
        } catch (error) {
          console.error("Error fetching groups:", error);
        }
      } else {
        setShowYearDropdown(false);
        setShowDepartmentDropdown(false);
        setPermissionData((prev) => ({ ...prev, assignedRoles: value }));
      }
    }

    if (name === "weekly") {
      setWeeklyChecked(checked);
    }

    setPermissionData({
      ...permissionData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleYearMenuOpen = (event) => {
    setYearAnchorEl(event.currentTarget);
  };

  // Handle Department Menu Open
  const handleDepartmentMenuOpen = (event) => {
    setDepartmentAnchorEl(event.currentTarget);
  };

  // Handle Menu Close
  const handleMenuClose = () => {
    setYearAnchorEl(null);
    setDepartmentAnchorEl(null);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setPermissionData((prev) => ({ ...prev, assignedRoles: `Year:${year}` }));
    handleMenuClose();
  };

  // Handle Department Select
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setPermissionData((prev) => ({ ...prev, assignedRoles: `Department:${department}` }));
    handleMenuClose();
  };

  const handleGroupSelect = (groupName) => {
    setPermissionData((prev) => ({ ...prev, assignedRoles: groupName }));
    setGroupsPopupOpen(false);
  };
  const handleAddOtherOption = (qIndex, isChecked) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      const question = newQuestions[qIndex];
      
      // Update the skip_based_on_answer flag
      question.add_other_option = isChecked;
      
      if (isChecked) {
        // Add "Other" option if it doesn't already exist
        if (!question.options.includes("Other")) {
          question.options = [...question.options, "Other"];
        }
      } else {
        // Remove "Other" option if it exists
        question.options = question.options.filter(option => option !== "Other");
      }
      
      return newQuestions;
    });
  };

 

  // const savePermissionDataToDatabase = async () => {
  //   try {
  //     // Validate mandatory fields
  //     if (!dateTimeAllocationChecked) {
  //       alert("Please enable 'Date, Start and end time allocation' as it's mandatory");
  //       return;
  //     }
  
  //     if (!permissionData.startDate || !permissionData.startTime || 
  //         !permissionData.endDate || !permissionData.endTime) {
  //       alert("Please fill all date and time fields as they are mandatory");
  //       return;
  //     }
  
  //     if (!assignRolesChecked) {
  //       alert("Please enable 'Assign to roles' as it's mandatory");
  //       return;
  //     }
  
  //     if (!permissionData.assignedRoles || permissionData.assignedRoles === "Placeholder") {
  //       alert("Please select a role to assign as it's mandatory");
  //       return;
  //     }
  
  //     if (!setResponseLimitChecked) {
  //       alert("Please enable 'Set response limit' as it's mandatory");
  //       return;
  //     }
  
  //     // If all validations pass, proceed with saving
  //     const token = localStorage.getItem("token");
  //     const response = await axios.post(
  //       "http://localhost:5000/save-permissions",
  //       {
  //         ...permissionData,
  //         surveyTitle,
  //         survey_id: surveyId,
  //         startDate: permissionData.startDate,
  //         startTime: permissionData.startTime,
  //         endDate: permissionData.endDate,
  //         endTime: permissionData.endTime,
  //         assignedRoles: permissionData.assignedRoles,
  //         responseLimit: permissionData.responseLimit
  //       },
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );
  
  //     if (response.status === 200) {
  //       alert("Permissions saved successfully!");
  //       setOpenDialog(false);
  //     }
  //   } catch (error) {
  //     console.error("Error saving permissions:", error);
  //     alert("Failed to save permissions.");
  //   }
  // };
  // const savePermissionDataToDatabase = async () => {
  //   try {
  //     // Validate mandatory fields
  //     if (!dateTimeAllocationChecked) {
  //       alert("Please enable 'Date, Start and end time allocation' as it's mandatory");
  //       return false; // Return false to indicate validation failed
  //     }
  
  //     if (!permissionData.startDate || !permissionData.startTime || 
  //         !permissionData.endDate || !permissionData.endTime) {
  //       alert("Please fill all date and time fields as they are mandatory");
  //       return false;
  //     }

  //     // Validate date and time are not in the past
  //     const now = new Date();
  //     now.setSeconds(0, 0); // Remove milliseconds and seconds for accurate comparison
      
  //     const startDateTime = new Date(`${permissionData.startDate}T${permissionData.startTime}`);
  //     const endDateTime = new Date(`${permissionData.endDate}T${permissionData.endTime}`);
      
  //     // Allow present or future start date and time
  //     if (startDateTime < now && startDateTime.toISOString().slice(0, 16) !== now.toISOString().slice(0, 16)) {
  //       alert("Please provide a valid present or future start date and time");
  //       return false;
  //     }
      
  //     // Allow present or future end date and time
  //     if (endDateTime < now && endDateTime.toISOString().slice(0, 16) !== now.toISOString().slice(0, 16)) {
  //       alert("Please provide a valid present or future end date and time");
  //       return false;
  //     }
      
  //     // Ensure end date and time is after start date and time
  //     if (endDateTime < startDateTime) {
  //       alert("End date and time must be after start date and time");
  //       return false;
  //     }
      
  //     if (!assignRolesChecked) {
  //       alert("Please enable 'Assign to roles' as it's mandatory");
  //       return false;
  //     }
  
  //     if (!permissionData.assignedRoles || permissionData.assignedRoles === "Placeholder") {
  //       alert("Please select a role to assign as it's mandatory");
  //       return false;
  //     }
  
  //     if (!setResponseLimitChecked) {
  //       alert("Please enable 'Set response limit' as it's mandatory");
  //       return false;
  //     }
  
  //     // If all validations pass, proceed with saving
  //     const token = localStorage.getItem("token");
  //     const response = await axios.post(
  //       "http://localhost:5000/save-permissions",
  //       {
  //         ...permissionData,
  //         surveyTitle,
  //         survey_id: surveyId,
  //         startDate: permissionData.startDate,
  //         startTime: permissionData.startTime,
  //         endDate: permissionData.endDate,
  //         endTime: permissionData.endTime,
  //         assignedRoles: permissionData.assignedRoles,
  //         responseLimit: permissionData.responseLimit
  //       },
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );
  
  //     if (response.status === 200) {
  //       alert("Permissions saved successfully!");
  //       setOpenDialog(false); // Only close dialog on successful save
  //       return true; // Return true to indicate success
  //     }
  //   } catch (error) {
  //     console.error("Error saving permissions:", error);
  //     alert("Failed to save permissions.");
  //     return false;
  //   }
  //   return false;
  // };
  const savePermissionDataToDatabase = async () => {
    try {
      // Validate mandatory fields
      if (!dateTimeAllocationChecked) {
        alert("Please enable 'Date, Start and end time allocation' as it's mandatory");
        return false; // Return false to indicate validation failed
      }
  
      if (
        !permissionData.startDate ||
        !permissionData.startTime ||
        !permissionData.endDate ||
        !permissionData.endTime
      ) {
        alert("Please fill all date and time fields as they are mandatory");
        return false;
      }
  
      // Validate date and time are not in the past
      const now = new Date();
      now.setSeconds(0, 0); // Remove milliseconds and seconds for accurate comparison
  
      const startDateTime = new Date(`${permissionData.startDate}T${permissionData.startTime}`);
      const endDateTime = new Date(`${permissionData.endDate}T${permissionData.endTime}`);
  
      // Allow present or future start date and time
      if (
        startDateTime < now &&
        startDateTime.toISOString().slice(0, 16) !== now.toISOString().slice(0, 16)
      ) {
        alert("Please provide a valid present or future start date and time");
        return false;
      }
  
      // Allow present or future end date and time
      if (
        endDateTime < now &&
        endDateTime.toISOString().slice(0, 16) !== now.toISOString().slice(0, 16)
      ) {
        alert("Please provide a valid present or future end date and time");
        return false;
      }
  
      // Ensure end date and time is after start date and time
      if (endDateTime < startDateTime) {
        alert("End date and time must be after start date and time");
        return false;
      }
  
      // NEW FUNCTIONALITY: If startDate and endDate are the same, endTime must be after startTime
      if (permissionData.startDate === permissionData.endDate) {
        const [startHours, startMinutes] = permissionData.startTime.split(":").map(Number);
        const [endHours, endMinutes] = permissionData.endTime.split(":").map(Number);
  
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
  
        if (endTotalMinutes <= startTotalMinutes) {
          alert("For same start and end dates, end time must be after start time");
          return false;
        }
      }
  
      if (!assignRolesChecked) {
        alert("Please enable 'Assign to roles' as it's mandatory");
        return false;
      }
  
      if (!permissionData.assignedRoles || permissionData.assignedRoles === "Placeholder") {
        alert("Please select a role to assign as it's mandatory");
        return false;
      }
  
      if (!setResponseLimitChecked) {
        alert("Please enable 'Set response limit' as it's mandatory");
        return false;
      }
  
      // If all validations pass, proceed with saving
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/save-permissions",
        {
          ...permissionData,
          surveyTitle,
          survey_id: surveyId,
          startDate: permissionData.startDate,
          startTime: permissionData.startTime,
          endDate: permissionData.endDate,
          endTime: permissionData.endTime,
          assignedRoles: permissionData.assignedRoles,
          responseLimit: permissionData.responseLimit
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
  
      if (response.status === 200) {
        alert("Permissions saved successfully!");
        setOpenDialog(false); // Only close dialog on successful save
        return true; // Return true to indicate success
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      alert("Failed to save permissions.");
      return false;
    }
    return false;
  };
  
  

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <div style={{ width: "80rem", maxWidth: "112rem", backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 40px", backgroundColor: "white", boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)", zIndex: 1000 }}>
          <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#6a4bbc" }}>BIT SURVEY</span>
            <span style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}> &gt; survey creation</span>
          </div>
          <TextField placeholder="Search for something" size="small" variant="outlined" style={{ backgroundColor: "#f0f2f5", borderRadius: "8px", width: "250px", marginRight: "20px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <IconButton><Settings /></IconButton>
            <IconButton><Notifications /></IconButton>
          </div>
        </div>
        <div style={{ width: "90%", maxWidth: "800px", margin: "100px auto 0", textAlign: "left" }}>
          <TextField
            value={surveyTitle}
            onChange={handleSurveyTitleChange}
            variant="outlined"
            fullWidth
            style={{ fontSize: "24px", fontWeight: "bold", color: "#333", marginBottom: "20px" }}
          />
          {questions.map((question, qIndex) => (
            <div key={qIndex} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px", backgroundColor: "#fff", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Button
                    variant="text"
                    style={{
                      color: "black",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: "bold",
                      borderBottom: activePage === "edit" ? "1.5px solid red" : "none",
                      paddingBottom: "2px",
                      outline: "none",
                    }}
                    onClick={() => {
                      setActivePage("edit");
                      setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, showOptions: false } : q)));
                    }}
                  >
                    EDIT
                  </Button>
                  <Button
                    variant="text"
                    style={{
                      color: "black",
                      textTransform: "none",
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginLeft: "10px",
                      borderBottom: activePage === "options" ? "1.5px solid red" : "none",
                      paddingBottom: "2px",
                      outline: "none",
                    }}
                    onClick={() => {
                      setActivePage("options");
                      handleToggleOptions(qIndex);
                    }}
                  >
                    OPTIONS
                  </Button>
                </div>
              </div>
              {question.showOptions && (
                <div style={{ marginTop: "10px" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={question.require_answer}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[qIndex].require_answer = e.target.checked;
                          setQuestions(newQuestions);
                        }}
                      />
                    }
                    label="Require an answer to this question"
                    style={{ display: "block" }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={question.shuffle_answers}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[qIndex].shuffle_answers = e.target.checked;
                          setQuestions(newQuestions);
                        }}
                      />
                    }
                    label="Shuffle answers for each respondent (does not apply to 'Other' or 'None of the Above' answer choices)"
                    style={{ display: "block" }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={question.shuffle_questions}
                        onChange={(e) => {
                          const newQuestions = questions.map((q, index) =>
                            index === qIndex ? { ...q, shuffle_questions: e.target.checked } : q
                          );
                          setQuestions(newQuestions);
                        }}
                      />
                    }
                    label="Shuffle questions for each respondent"
                    style={{ display: "block" }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={question.skip_based_on_answer}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[qIndex].skip_based_on_answer = e.target.checked;
                          setQuestions(newQuestions);
                        }}
                      />
                    }
                    label="Add Other option with text"
                    style={{ display: "block" }}
                  />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>Q{question.id}</span>
                <div>
                  <IconButton onClick={() => handleCopyQuestion(qIndex)} style={{ color: "#6a4bbc" }}><ContentCopy /></IconButton>
                  <IconButton style={{ color: "#6a4bbc" }}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteQuestion(qIndex)} style={{ color: "#6a4bbc" }}><Delete /></IconButton>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
      <TextField
        placeholder="Enter the question"
        fullWidth
        variant="outlined"
        size="small"
        value={question.text}
        onChange={(e) => {
          const newQuestions = [...questions];
          newQuestions[qIndex].text = e.target.value;
          setQuestions(newQuestions);
        }}
        onClick={() => handleExpand(qIndex)}
      />
      <Select
        value={question.type}
        onChange={(e) => {
          const newQuestions = [...questions];
          newQuestions[qIndex].type = e.target.value;
          setQuestions(newQuestions);
        }}
        size="small"
        style={{ minWidth: "150px" }}
      >
        <MenuItem value="multiple">Multiple Choice</MenuItem>
        <MenuItem value="text">Text</MenuItem>
        
      </Select>
    </div>

    {/* Conditionally render options based on question type */}
    {question.type !== "text" && question.expanded && (
      <div style={{ marginTop: "20px" }}>
        <strong>Predefined Options</strong>
        {question.options.map((option, oIndex) => (
          <div key={oIndex} style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
            {editingOption.qIndex === qIndex && editingOption.oIndex === oIndex ? (
              <TextField
                value={option}
                size="small"
                fullWidth
                variant="outlined"
                style={{ flex: 1, marginRight: "10px" }}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                onBlur={() => handleSaveEditedOption(qIndex, oIndex, option)}
              />
            ) : (
              <TextField
                value={option}
                size="small"
                fullWidth
                variant="outlined"
                style={{ flex: 1, marginRight: "10px" }}
                onClick={() => handleEditOption(qIndex, oIndex)}
              />
            )}
            <IconButton onClick={() => handleRemoveOption(qIndex, oIndex)}><RemoveCircleOutline /></IconButton>
            <IconButton onClick={() => handleAddOption(qIndex)}><AddCircleOutline /></IconButton>
          </div>
        ))}
        <FormControlLabel
          control={
            <Checkbox
              checked={question.score_question}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].score_question = e.target.checked;
                setQuestions(newQuestions);
              }}
            />
          }
          label="Score this question (enable quiz mode)"
          style={{ display: "block" }}
        />
        <FormControlLabel
          control={
            <Checkbox
            checked={question.add_other_option}
            onChange={(e) => handleAddOtherOption(qIndex, e.target.checked)}
          />
          }
          label="Add an 'Other' Answer Option"
          style={{ display: "block" }}
        />
      </div>
    )}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "10px" }}>
                <IconButton
                  style={{ color: "#6a4bbc" }}
                  onClick={() => {
                    setActiveQuestionIndex(qIndex);
                    setBulkDialogOpen(true);
                  }}
                >
                  <PlaylistAdd />
                </IconButton>
                <span style={{ fontSize: "14px", color: "#6a4bbc", marginLeft: "5px" }}>+ Bulk Answers</span>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <Button variant="contained" style={{ backgroundColor: "#6a4bbc", color: "white" }} onClick={handleAddQuestion}>+ Next Question</Button>
            <div>
              <Button variant="outlined" style={{ marginRight: "10px", borderColor: "#6a4bbc", color: "#6a4bbc" }}>Cancel</Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#6a4bbc", color: "white" }}
                onClick={() => handleFinishSurvey(false)}
              >
                Finish Survey
              </Button>
            </div>
          </div>
          <br />
          <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#f5f5f5" }}>
            <Button
              variant="text"
              style={{
                color: "black",
                textTransform: "none",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "14px",
              }}
              onClick={() => setModalOpen(true)}
            >
              Copy and paste questions
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ fontWeight: "bold", fontFamily: "'Poppins', sans-serif", fontSize: "35px" }}>Add answers in bulk</DialogTitle>
        <Divider></Divider>
        <DialogTitle style={{ fontWeight: "bold", fontFamily: "'Poppins', sans-serif", fontSize: "20px" }}>Enter each answer choice on a separate line</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          />
        </DialogContent>
        <br />
        <Divider></Divider>
        <br />
        <DialogActions style={{ backgroundColor: "white", padding: "15px" }}>
  <Button onClick={async () => {
    const success = await savePermissionDataToDatabase();
    if (success) {
      setOpenDialog(false);
    }
  }} style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px" }}>
    Save
  </Button>
</DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => {}} maxWidth="md" fullWidth>
  <DialogTitle style={{ fontWeight: "bold", backgroundColor: "white", padding: "15px" }}>
    Permissions
  </DialogTitle>
  <DialogContent style={{ display: "flex", flexDirection: "column", width: "50rem", height: "35rem", backgroundColor: "white" }}>
    {/* Date Time Allocation - Mandatory */}
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={dateTimeAllocationChecked}
            onChange={(e) => setDateTimeAllocationChecked(e.target.checked)}
          />
        }
        label={
          <span>
            Date, Start and end time allocation
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          </span>
        }
      />
      {dateTimeAllocationChecked && (
        <div style={{ display: "flex", gap: "20px", marginLeft: "20px", flexWrap: "wrap" }}>
          <TextField
            label={
              <span>
                Start Date
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </span>
            }
            type="date"
            name="startDate"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            style={{ flex: 1 }}
            value={permissionData.startDate}
            onChange={handlePermissionDataChange}
          />
          <TextField
            label={
              <span>
                Start Time
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </span>
            }
            type="time"
            name="startTime"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            style={{ flex: 1 }}
            value={permissionData.startTime}
            onChange={handlePermissionDataChange}
          />
          <TextField
            label={
              <span>
                End Date
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </span>
            }
            type="date"
            name="endDate"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            style={{ flex: 1 }}
            value={permissionData.endDate}
            onChange={handlePermissionDataChange}
          />
          <TextField
            label={
              <span>
                End Time
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </span>
            }
            type="time"
            name="endTime"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            style={{ flex: 1 }}
            value={permissionData.endTime}
            onChange={handlePermissionDataChange}
          />
        </div>
      )}
    </div>
    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "15px 0", border: "2px solid #bdbdbd" }} />

    {/* Scheduling frequencies - Optional */}
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
      <FormControlLabel
        control={<Checkbox checked={schedulingFrequencyChecked} onChange={(e) => setSchedulingFrequencyChecked(e.target.checked)} />}
        label="Scheduling frequencies"
      />
      {schedulingFrequencyChecked && (
        <div style={{ display: "flex", gap: "10px", marginLeft: "20px", flexWrap: "wrap" }}>
          <FormControlLabel control={<Checkbox name="daily" checked={permissionData.schedulingFrequency.includes('daily')} onChange={(e) => {
            const updatedFrequency = permissionData.schedulingFrequency.includes('daily')
              ? permissionData.schedulingFrequency.filter((f) => f !== 'daily')
              : [...permissionData.schedulingFrequency, 'daily'];
            setPermissionData({ ...permissionData, schedulingFrequency: updatedFrequency });
          }} />} label="Daily" />
          <FormControlLabel control={<Checkbox name="weekly" checked={permissionData.schedulingFrequency.includes('weekly')} onChange={(e) => {
            const updatedFrequency = permissionData.schedulingFrequency.includes('weekly')
              ? permissionData.schedulingFrequency.filter((f) => f !== 'weekly')
              : [...permissionData.schedulingFrequency, 'weekly'];
            setPermissionData({ ...permissionData, schedulingFrequency: updatedFrequency });
            setWeeklyChecked(e.target.checked);
          }} />} label="Weekly" />
          <FormControlLabel control={<Checkbox name="monthly" checked={permissionData.schedulingFrequency.includes('monthly')} onChange={(e) => {
            const updatedFrequency = permissionData.schedulingFrequency.includes('monthly')
              ? permissionData.schedulingFrequency.filter((f) => f !== 'monthly')
              : [...permissionData.schedulingFrequency, 'monthly'];
            setPermissionData({ ...permissionData, schedulingFrequency: updatedFrequency });
          }} />} label="Monthly" />
        </div>
      )}
      {schedulingFrequencyChecked && weeklyChecked && (
        <div style={{ display: "flex", gap: "10px", marginLeft: "20px", flexWrap: "wrap" }}>
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <FormControlLabel
              key={day.toLowerCase()}
              control={
                <Checkbox
                  name={day.toLowerCase()}
                  checked={permissionData.daysOfWeek.includes(day.toLowerCase())}
                  onChange={(e) => {
                    const updatedDays = permissionData.daysOfWeek.includes(day.toLowerCase())
                      ? permissionData.daysOfWeek.filter((d) => d !== day.toLowerCase())
                      : [...permissionData.daysOfWeek, day.toLowerCase()];
                    setPermissionData({ ...permissionData, daysOfWeek: updatedDays });
                  }}
                />
              }
              label={day}
            />
          ))}
        </div>
      )}
    </div>
    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "15px 0", border: "2px solid #bdbdbd" }} />

    {/* Random timing - Optional */}
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
      <FormControlLabel
        control={<Checkbox checked={randomTimingChecked} onChange={(e) => setRandomTimingChecked(e.target.checked)} />}
        label="Populate in random timing in a specific duration of time"
      />
      {randomTimingChecked && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "20px" }}>
          <TextField label="Time difference (optional)" name="timeDifference" variant="outlined" fullWidth defaultValue="5 minutes" value={permissionData.timeDifference} onChange={handlePermissionDataChange} />
        </div>
      )}
    </div>
    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "15px 0", border: "2px solid #bdbdbd" }} />

    {/* Send reminders - Optional */}
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
      <FormControlLabel control={<Checkbox name="sendReminders" checked={permissionData.sendReminders} onChange={handlePermissionDataChange} />} label="Send reminders to the respondents" />
    </div>
    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "15px 0", border: "2px solid #bdbdbd" }} />

    {/* Assign to roles - Mandatory */}
    
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
  <FormControlLabel
    control={<Checkbox checked={assignRolesChecked} onChange={(e) => setAssignRolesChecked(e.target.checked)} />}
    label={
      <span>
        Assign to roles
        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
      </span>
    }
  />
  {assignRolesChecked && (
    <div style={{ marginLeft: "20px", width: "200px" }}>
      <Select
        fullWidth
        name="assignedRoles"
        value={permissionData.assignedRoles}
        onChange={handlePermissionData}
        renderValue={(selected) => {
          if (selected === "Group") {
            return "Create Group";
          } else if (groups.find(group => group.GroupName === selected)) {
            return selected;
          } else {
            return selected;
          }
        }}
      >
        <MenuItem value="Placeholder">Placeholder</MenuItem>
       
        {/* Year menu item with nested dropdown */}
        <MenuItem
          onMouseEnter={handleYearMenuOpen}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          Year
          <span style={{ marginLeft: '20px' }}>→</span>
        </MenuItem>
       
        {/* Department menu item with nested dropdown */}
        <MenuItem
          onMouseEnter={handleDepartmentMenuOpen}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          Department
          <span style={{ marginLeft: '20px' }}>→</span>
        </MenuItem>
       
        <MenuItem value="Group">Create Group</MenuItem>
        {permissionData.assignedRoles === "Group" &&
          groups.map((group) => (
            <MenuItem key={group.GroupID} value={group.GroupName}>
              {group.GroupName}
            </MenuItem>
          ))}
      </Select>
     
      {/* Year submenu */}
      <Menu
        anchorEl={yearAnchorEl}
        open={Boolean(yearAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => handleYearSelect("I")}>I</MenuItem>
        <MenuItem onClick={() => handleYearSelect("II")}>II</MenuItem>
        <MenuItem onClick={() => handleYearSelect("III")}>III</MenuItem>
        <MenuItem onClick={() => handleYearSelect("IV")}>IV</MenuItem>
      </Menu>
     
      {/* Department submenu */}
      <Menu
        anchorEl={departmentAnchorEl}
        open={Boolean(departmentAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => handleDepartmentSelect("CSE")}>CSE</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("IT")}>IT</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("AIDS")}>AIDS</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("AIML")}>AIML</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("ECE")}>ECE</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("MECH")}>MECH</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("CT")}>CT</MenuItem>
        <MenuItem onClick={() => handleDepartmentSelect("FT")}>FT</MenuItem>
      </Menu>
    </div>
  )}
</div>
    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "15px 0", border: "2px solid #bdbdbd" }} />

    {/* Set response limit - Mandatory */}
    <div style={{ backgroundColor: "white", padding: "10px", borderRadius: "5px" }}>
      <FormControlLabel
        control={<Checkbox checked={setResponseLimitChecked} onChange={(e) => setSetResponseLimitChecked(e.target.checked)} />}
        label={
          <span>
            Set response limit
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          </span>
        }
      />
      {setResponseLimitChecked && (
        <div style={{ marginLeft: "20px", width: "200px" }}>
          <Select fullWidth name="responseLimit" value={permissionData.responseLimit} onChange={handlePermissionDataChange}>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </div>
      )}
    </div>
    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "15px 0", border: "2px solid #bdbdbd" }} />
  </DialogContent>

  <DialogActions style={{ backgroundColor: "white", padding: "15px" }}>
    <Button onClick={async () => {
      const success = await savePermissionDataToDatabase();
      if (!success) {
        // Dialog remains open if save fails
        return;
      }
    }} style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px" }}>
      Save
    </Button>
  </DialogActions>
</Dialog>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          display: "flex",
          gap: 4
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Import Questions
            </Typography>
            <TextField
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              placeholder="Paste your questions here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Box>

          <Box sx={{ flex: 1, backgroundColor: "#f9f9f9", p: 2, borderRadius: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Preview
            </Typography>
            <Box sx={{ mt: 2 }}>
              {inputText.split("\n\n").map((block, index) => {
                const lines = block.split("\n");
                const question = lines[0];
                const choices = lines.slice(1);
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>{question}</Typography>
                    {!hideAnswers && (
                      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {choices.map((choice, idx) => (
                          <li key={idx} style={{ marginBottom: "8px" }}>
                            <Typography>A{idx + 1}. {choice}</Typography>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Box>
                );
              })}
            </Box>
            <Button
              variant="text"
              sx={{ color: "#6a4bbc", textTransform: "none" }}
              onClick={() => setHideAnswers(!hideAnswers)}
            >
              {hideAnswers ? "Show Answers" : "Hide Answers"}
            </Button>
          </Box>

          <Box sx={{
            position: "absolute",
            bottom: 16,
            right: 28,
            display: "flex",
            gap: 2
          }}>
            <Button
              variant="contained"
              onClick={handleAddParsedQuestions}
              sx={{
                backgroundColor: "#6a4bbc",
                color: "white",
                textTransform: "none",
                borderRadius: 2,
                px: 19,
                py: 1,
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Add Questions
            </Button>
          </Box>
        </Box>
      </Modal>

      <Dialog open={groupsPopupOpen} onClose={() => setGroupsPopupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ fontWeight: "bold", fontFamily: "'Poppins', sans-serif", fontSize: "35px" }}>Groups</DialogTitle>
        <Divider></Divider>
        <DialogContent>
          <List>
            {groups.map((group) => (
              <ListItem key={group.GroupID} button onClick={() => handleGroupSelect(group.GroupName)}>
                <ListItemText primary={group.GroupName} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <br />
        <Divider></Divider>
        <br />
        <DialogActions>
          <Button onClick={() => setGroupsPopupOpen(false)} variant="contained" color="black" style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "white", color: "black", textTransform: "none", minWidth: "100px" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SurveyCreation;