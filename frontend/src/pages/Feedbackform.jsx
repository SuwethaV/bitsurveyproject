import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollno: '',
    facultyname: '',
    videosUseful: '',
    materialsUseful: '',
    clearPSLevels: '',
    feedback: ''
  });

  const [errors, setErrors] = useState({});
  const [editableQuestions, setEditableQuestions] = useState({});
  const [editing, setEditing] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleQuestionChange = (e, field) => {
    const { value } = e.target;
    setEditableQuestions({
      ...editableQuestions,
      [field]: value
    });
  };

  const toggleEdit = (field) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.rollno) newErrors.rollno = 'Roll No is required';
    if (!formData.facultyname) newErrors.facultyname = 'Faculty Name is required';
    if (!formData.videosUseful) newErrors.videosUseful = 'This field is required';
    if (!formData.materialsUseful) newErrors.materialsUseful = 'This field is required';
    if (!formData.clearPSLevels) newErrors.clearPSLevels = 'This field is required';
    if (!formData.feedback) newErrors.feedback = 'Feedback is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw', 
      backgroundColor: '#f0f0f0'
    }}>
      <form onSubmit={handleSubmit} style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', 
        width: '90%', 
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#6a5acd', textAlign: 'center', marginBottom: '20px' }}>Feedback Form</h2>

        {['name', 'rollno', 'facultyname', 'videosUseful', 'materialsUseful', 'clearPSLevels', 'feedback'].map((field, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {editing[field] ? (
                <input
                  type="text"
                  value={editableQuestions[field] || ''}
                  onChange={(e) => handleQuestionChange(e, field)}
                  onBlur={() => toggleEdit(field)}
                  style={{ width: '80%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              ) : (
                <label style={{ color: '#6a5acd' }}>
                  {editableQuestions[field] || (
                    field === 'videosUseful' ? 'Is the videos provided by the skill team useful?' :
                    field === 'materialsUseful' ? 'Is the materials provided by the team useful?' :
                    field === 'clearPSLevels' ? 'Can you clear PS levels?' :
                    field.charAt(0).toUpperCase() + field.slice(1) + ':'
                  )}
                </label>
              )}
              <IconButton onClick={() => toggleEdit(field)}>
                <EditIcon />
              </IconButton>
            </div>

            {field === 'videosUseful' || field === 'materialsUseful' || field === 'clearPSLevels' ? (
              <select
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : (
              <input
                type={field === 'feedback' ? 'textarea' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            )}

            {errors[field] && <span style={{ color: 'red', display: 'block', marginTop: '5px' }}>{errors[field]}</span>}
          </div>
        ))}

        <button type="submit" style={{ 
          backgroundColor: '#6a5acd', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '4px', 
          border: 'none', 
          cursor: 'pointer', 
          width: '100%'
        }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
