import { useState, useEffect, type ReactElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Destination } from '../components/Destination';
import { MapCard } from '../components/MapCard';
import { type Destination as DestinationType } from '../types/destination';
import { type ViewMode } from '../components/Layout';

interface OutletContext {
  viewMode: ViewMode;
}

export const TripPage = (): ReactElement => {
  const { viewMode } = useOutletContext<OutletContext>();
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (viewMode === 'carousel' && destinations.length > 0) {
      setCurrentIndex(Math.min(currentIndex, destinations.length - 1));
    }
  }, [destinations.length, viewMode, currentIndex]);

  const handleAddDestination = (index?: number): void => {
    const newDestination: DestinationType = {
      id: crypto.randomUUID(),
      name: '',
      displayName: '',
    };
    setNewlyCreatedId(newDestination.id);
    if (index !== undefined) {
      const newDestinations = [...destinations];
      newDestinations.splice(index, 0, newDestination);
      setDestinations(newDestinations);
      if (viewMode === 'carousel') {
        setCurrentIndex(index);
      }
    } else {
      setDestinations([...destinations, newDestination]);
      if (viewMode === 'carousel') {
        setCurrentIndex(destinations.length);
      }
    }
  };

  const handlePrevious = (): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (): void => {
    setCurrentIndex((prev) => Math.min(destinations.length - 1, prev + 1));
  };

  const handleDestinationChange = (updatedDestination: DestinationType): void => {
    setDestinations((prev) =>
      prev.map((dest) => (dest.id === updatedDestination.id ? updatedDestination : dest))
    );
    if (updatedDestination.id === newlyCreatedId) {
      setNewlyCreatedId(null);
    }
  };

  if (viewMode === 'carousel') {
    const currentDestination = destinations[currentIndex];
    const hasDestinations = destinations.length > 0;

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
            scrollbarGutter: 'stable both-edges',
          }}
        >
          <MapCard destinations={destinations} />
          {hasDestinations && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <IconButton
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                color="primary"
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2">
                {currentIndex + 1} / {destinations.length}
              </Typography>
              <IconButton
                onClick={handleNext}
                disabled={currentIndex === destinations.length - 1}
                color="primary"
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          )}
          {hasDestinations ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={() => handleAddDestination(currentIndex)}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Destination
                  key={currentDestination.id}
                  destination={currentDestination}
                  onDestinationChange={handleDestinationChange}
                  shouldFocus={currentDestination.id === newlyCreatedId}
                  alwaysExpanded
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={() => handleAddDestination(currentIndex + 1)}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddDestination()}
              sx={{ mt: 2 }}
              fullWidth
            >
              Add Destination
            </Button>
          )}
        </Stack>
      </Box>
    );
  }

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
          scrollbarGutter: 'stable both-edges',
        }}
      >
        <MapCard destinations={destinations} />
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
              onDestinationChange={handleDestinationChange}
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
