import { useState, type ReactElement } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { Destination } from '../components/Destination';
import { type Destination as DestinationType } from '../types/destination';

export const TripPage = (): ReactElement => {
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const handleAddDestination = (index?: number): void => {
    const newDestination: DestinationType = {
      id: crypto.randomUUID(),
      name: '',
    };
    setNewlyCreatedId(newDestination.id);
    if (index !== undefined) {
      const newDestinations = [...destinations];
      newDestinations.splice(index, 0, newDestination);
      setDestinations(newDestinations);
    } else {
      setDestinations([...destinations, newDestination]);
    }
  };

  const handleNameChange = (id: string, name: string): void => {
    setDestinations((prev) =>
      prev.map((dest) => (dest.id === id ? { ...dest, name } : dest))
    );
    if (id === newlyCreatedId) {
      setNewlyCreatedId(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Stack
        sx={{
          flex: 1,
          overflow: 'auto',
          gap: 2,
        }}
      >
        {destinations.map((destination, index) => (
          <Box key={destination.id}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <IconButton
                onClick={() => handleAddDestination(index)}
                color="primary"
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Destination
              destination={destination}
              onNameChange={handleNameChange}
              shouldFocus={destination.id === newlyCreatedId}
            />
          </Box>
        ))}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddDestination()}
          sx={{ mt: 2 }}
          fullWidth
        >
          Add Destination
        </Button>
      </Stack>
    </Box>
  );
};
