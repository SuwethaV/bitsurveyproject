
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Radio, RadioGroup, FormControlLabel, Button, LinearProgress, TextField, useMediaQuery } from '@mui/material';
import axios from 'axios';

const SurveyQuestions = () => {
  const { title } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { canResubmit, submissionCount } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textResponse, setTextResponse] = useState('');
  const [otherResponse, setOtherResponse] = useState('');
  const [error, setError] = useState(null);
  const [surveyId, setSurveyId] = useState(null);
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const studentEmail = user?.email;
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/surveyquestions/${title}`, {
          headers: { Authorization: token },
        });

        let fetchedQuestions = response.data;

        if (fetchedQuestions.length > 0 && fetchedQuestions[0].shuffle_questions === 1) {
          fetchedQuestions = fetchedQuestions.sort(() => Math.random() - 0.5);
        }

        setQuestions(fetchedQuestions);

        const surveyResponse = await axios.post('http://localhost:5000/create-survey', {
          survey_title: title,
          user_email: studentEmail
        }, {
          headers: { Authorization: token }
        });
        
        setSurveyId(surveyResponse.data.survey_id);
      } catch (error) {
        console.error('Error fetching survey questions:', error);
        setError('Failed to fetch survey questions. Please try again later.');
      }
    };

    fetchQuestions();
  }, [title, token, studentEmail]);

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.require_answer === 1) {
      if (currentQuestion.texts === 1 && !textResponse.trim()) {
        alert('Please enter your response before proceeding.');
        return;
      } else if (currentQuestion.texts !== 1 && !selectedOption) {
        alert('Please choose an option before proceeding.');
        return;
      } else if (selectedOption === 'Other' && currentQuestion.skip_based_on_answer === 1 && !otherResponse.trim()) {
        alert('Please specify your response for "Other".');
        return;
      }
    }

    try {
      await axios.post('http://localhost:5000/save-response', {
        survey_id: surveyId,
        question_text: currentQuestion.question_text,
        response_text: currentQuestion.texts === 1 ? textResponse : (selectedOption === 'Other' ? otherResponse : null),
        selected_option: currentQuestion.texts === 1 ? null : (selectedOption === 'Other' ? 'Other' : selectedOption),
        student_email: studentEmail,
        survey_title: title
      }, {
        headers: { Authorization: token }
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setTextResponse('');
        setOtherResponse('');
      } else {
        await axios.post('http://localhost:5000/track-submission', {
          survey_title: title,
          student_email: studentEmail
        }, {
          headers: { Authorization: token }
        });

        alert(canResubmit ? 'Your response has been updated successfully!' : 'Your response has been saved successfully!');
        navigate('/userdashboard');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Failed to save your response. Please try again.');
    }
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="error">{error}</Typography>
      </Box>
    );
  }

  if (questions.length === 0 || !surveyId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="body1">Loading survey questions...</Typography>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const optionsToDisplay = currentQuestion.shuffle_options === 1
    ? [...currentQuestion.options].sort(() => Math.random() - 0.5)
    : currentQuestion.options;

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fc',
      p: isMobile ? 2 : 3
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ textAlign: 'center', p: isMobile ? 2 : 3, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000', mb: 1, fontSize: isMobile ? '1.5rem' : '2rem' }}>{title}</Typography>
          <Box sx={{ width: '100%', mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, width: '100%', borderRadius: 5, backgroundColor: '#EDF2F7',
              '& .MuiLinearProgress-bar': { backgroundColor: '#1FC16B', borderRadius: 5 } }} 
            />
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium', color: '#718096', fontSize: isMobile ? '0.9rem' : '1rem' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 2 : 3, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2D3748', fontSize: isMobile ? '1.2rem' : '1.4rem' }}>{currentQuestion.question_text}</Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 'min-content' }}>
            {currentQuestion.texts === 1 ? (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your answer here..."
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                multiline
                minRows={isMobile ? 4 : 5}
                sx={{ '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E0' },
                    '&.Mui-focused fieldset': { borderColor: '#7F56D9', borderWidth: '1px' }
                  }, flexGrow: 1 }}
              />
            ) : (
              <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}
                sx={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 1.5 }}>
                {optionsToDisplay.map((option, idx) => (
                  <Card key={idx} sx={{ borderRadius: '8px', border: '1px solid', borderColor: selectedOption === option.option_text ? '#7F56D9' : '#E2E8F0', backgroundColor: selectedOption === option.option_text ? '#F9F5FF' : 'white', transition: 'all 0.2s ease', '&:hover': { borderColor: selectedOption === option.option_text ? '#7F56D9' : '#CBD5E0' } }}>
                    <FormControlLabel
                      value={option.option_text}
                      control={<Radio sx={{ color: selectedOption === option.option_text ? '#7F56D9' : '#CBD5E0', p: isMobile ? 1 : 1.5, '&.Mui-checked': { color: '#7F56D9' } }} />}
                      label={<Typography sx={{ p: 1, fontSize: isMobile ? '1rem' : '1.1rem', color: '#2D3748', fontWeight: selectedOption === option.option_text ? 'medium' : 'normal' }}>{option.option_text}</Typography>}
                      sx={{ width: '100%', m: 0, p: isMobile ? 0.5 : 1 }}
                    />
                  </Card>
                ))}
              </RadioGroup>
            )}
            {selectedOption === 'Other' && currentQuestion.skip_based_on_answer === 1 && (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Please specify..."
                value={otherResponse}
                onChange={(e) => setOtherResponse(e.target.value)}
                sx={{ mt: 2, '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E0' },
                    '&.Mui-focused fieldset': { borderColor: '#7F56D9', borderWidth: '1px' }
                  }}}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', p: isMobile ? 2 : 3, borderTop: '1px solid #f0f0f0', backgroundColor: 'white' }}>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ backgroundColor: '#7F56D9', color: 'white', fontWeight: 'bold', px: isMobile ? 4 : 5, py: isMobile ? 1 : 1.2, borderRadius: '8px', textTransform: 'none', boxShadow: 'none', fontSize: isMobile ? '0.9rem' : '1rem', '&:hover': { backgroundColor: '#6941C6', boxShadow: 'none' }, '&:disabled': { backgroundColor: '#E2E8F0', color: '#A0AEC0' } }}
            disabled={currentQuestion.require_answer === 1 && (currentQuestion.texts === 1 ? !textResponse.trim() : (!selectedOption || (selectedOption === 'Other' && currentQuestion.skip_based_on_answer === 1 && !otherResponse.trim())))}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : canResubmit ? 'Update Submission' : 'Submit Survey'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SurveyQuestions;
