import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const GroupCreationModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: { xs: '90%', sm: '450px' }, // Increased width
          padding: '25px', // Increased padding
          textAlign: 'center',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Group creation
          </Typography>
          <Button
            onClick={closeModal}
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'red',
              cursor: 'pointer',
              minWidth: 'auto',
              padding: '4px 8px', // Made the "X" slightly wider
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)', // Slight hover effect
              },
            }}
          >
            X
          </Button>
        </Box>

        {/* Main Content */}
        <Box sx={{ marginBottom: '20px' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            {/* Placeholder avatars */}
            {[1, 2, 3].map((user) => (
              <Box
                key={user}
                sx={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#ccc',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#666',
                  fontSize: '14px',
                }}
              >
                U{user}
              </Box>
            ))}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Pick the members
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '14px' }}>
            You wanna create a new group! Add members to contribute to your survey.
          </Typography>
        </Box>

        {/* Call-to-Action Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#9370DB', // Light violet color
            color: 'white',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#7B68EE', // Slightly darker violet on hover
            },
          }}
          onClick={() => alert('Conditions set!')}
        >
          Set conditions
        </Button>
      </Box>
    </Box>
  );
};

export default GroupCreationModal;