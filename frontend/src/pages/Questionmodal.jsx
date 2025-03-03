import React, { useState } from 'react';
import { Button, Modal, TextField, Box, Typography } from '@mui/material';

function QuestionModal() {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    parseQuestions(event.target.value);
  };

  const parseQuestions = (text) => {
    const questionBlocks = text.split('\n\n');
    const parsedQuestions = questionBlocks.map(block => {
      const lines = block.split('\n');
      const question = lines[0];
      const choices = lines.slice(1);
      return { question, choices };
    });
    setQuestions(parsedQuestions);
  };

  return (
    <div>
      <div style={{ textAlign: "center", padding: "10px", backgroundColor: "#f5f5f5" }}>
        <Button
          variant="text"
          style={{
            color: "black",
            textTransform: "none",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "14px",
          }}
          onClick={handleOpen}
        >
          Copy and paste questions
        </Button>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            Import Questions
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            placeholder="Paste your questions here..."
            value={inputText}
            onChange={handleInputChange}
          />
          <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
            Preview
          </Typography>
          <Box sx={{ mt: 2 }}>
            {questions.map((q, index) => (
              <div key={index}>
                <Typography>{q.question}</Typography>
                <ul>
                  {q.choices.map((choice, idx) => (
                    <li key={idx}>{choice}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default QuestionModal; 