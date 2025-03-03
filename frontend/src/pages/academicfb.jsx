import React, { useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const AcademicFeedbackForm = () => {
  const [feedbacks, setFeedbacks] = useState([{
    student: '',
    facultyCourse: '',
    periodical: '',
    clarity: '',
    topicDiscussions: '',
    timeManagement: '',
    syllabusCoverage: '',
    satisfaction: '',
    comments: ''
  }]);

  const [openPopup, setOpenPopup] = useState(false);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newFeedbacks = [...feedbacks];
    newFeedbacks[index][name] = value;
    setFeedbacks(newFeedbacks);
  };

  const addAnotherFeedback = () => {
    setFeedbacks([...feedbacks, {
      student: '',
      facultyCourse: '',
      periodical: '',
      clarity: '',
      topicDiscussions: '',
      timeManagement: '',
      syllabusCoverage: '',
      satisfaction: '',
      comments: ''
    }]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setOpenPopup(true); // Show popup on submit
  };

  const handleClosePopup = () => {
    setOpenPopup(false); // Close popup
  };

  return (
    <div style={{ 
      padding: '20px', 
      width: '100vw', 
      height: '100vh', 
      boxSizing: 'border-box', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', 
        width: '90%', 
        maxWidth: '800px', 
        overflowY: 'auto', 
        maxHeight: '90vh' 
      }}>
        <h2 style={{ textAlign: 'center', color: '#6a5acd' }}>Create Academic Feedback</h2>
        {feedbacks.map((feedback, index) => (
          <form key={index} onSubmit={handleSubmit} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Student *</InputLabel>
              <Select
                name="student"
                value={feedback.student}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Student1">Student 1</MenuItem>
                <MenuItem value="Student2">Student 2</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Faculty & Course *</InputLabel>
              <Select
                name="facultyCourse"
                value={feedback.facultyCourse}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Faculty1">Faculty 1</MenuItem>
                <MenuItem value="Faculty2">Faculty 2</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Periodical *</InputLabel>
              <Select
                name="periodical"
                value={feedback.periodical}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Periodical1">Periodical 1</MenuItem>
                <MenuItem value="Periodical2">Periodical 2</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Faculty member conveys the message with necessary clarity *</InputLabel>
              <Select
                name="clarity"
                value={feedback.clarity}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Average">Average</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Topic discussions and materials provided help us understand the concept *</InputLabel>
              <Select
                name="topicDiscussions"
                value={feedback.topicDiscussions}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Average">Average</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>The faculty member is good at time management for all course related activities *</InputLabel>
              <Select
                name="timeManagement"
                value={feedback.timeManagement}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Average">Average</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Syllabus coverage is evenly-paced and completed on time *</InputLabel>
              <Select
                name="syllabusCoverage"
                value={feedback.syllabusCoverage}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Average">Average</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Overall satisfaction level of this course *</InputLabel>
              <Select
                name="satisfaction"
                value={feedback.satisfaction}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Average">Average</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="General Comments"
              name="comments"
              value={feedback.comments}
              onChange={(e) => handleChange(index, e)}
              multiline
              rows={4}
            />
          </form>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button
            variant="contained"
            style={{ backgroundColor: '#6a5acd', color: 'white', marginRight: '10px' }}
            onClick={addAnotherFeedback}
          >
            Create & Add Another
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: '#6a5acd', color: 'white' }}
            onClick={handleSubmit}
          >
            Create Academic Feedback
          </Button>
        </div>
      </div>

      {/* Popup for successful submission */}
      <Dialog open={openPopup} onClose={handleClosePopup}>
        <DialogTitle>Submission Successful</DialogTitle>
        <DialogContent>
          <p>Your feedback has been submitted successfully.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} style={{ backgroundColor: '#6a5acd', color: 'white' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AcademicFeedbackForm;