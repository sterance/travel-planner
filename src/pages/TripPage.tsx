import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dayjs, { type Dayjs } from 'dayjs';
import { Destination } from '../components/Destination';
import { MapCard } from '../components/MapCard';
import { SettingsCard } from '../components/SettingsCard';
import { type Destination as DestinationType } from '../types/destination';
import { type ViewMode, type LayoutMode } from '../App';
import { useTripContext } from '../context/TripContext';
import { calculateDestinationDates, calculateTripEndDate, hasDateErrors } from '../utils/dateCalculation';

interface OutletContext {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
  setColumns: (value: number) => void;
  maxAdjacent: number;
  setMaxAdjacent: (value: number) => void;
}

export const TripPage = (): ReactElement => {
  const { viewMode, layoutMode, columns, maxAdjacent } = useOutletContext<OutletContext>();
  const { tripId } = useParams<{ tripId: string }>();
  const { currentTrip, updateTrip, setCurrentTrip } = useTripContext();
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tripId && tripId !== currentTrip?.id) {
      setCurrentTrip(tripId);
    }
  }, [tripId, currentTrip?.id, setCurrentTrip]);

  const destinations = currentTrip?.destinations ?? [];
  const tripStartDate = currentTrip?.startDate ? dayjs(currentTrip.startDate) : null;

  const startDateDayjs = tripStartDate;
  const destinationDates = useMemo(
    () => calculateDestinationDates(startDateDayjs, destinations),
    [startDateDayjs, destinations]
  );
  const tripEndDate = useMemo(
    () => calculateTripEndDate(startDateDayjs, destinations),
    [startDateDayjs, destinations]
  );
  const dateErrorsExist = useMemo(
    () => hasDateErrors(startDateDayjs, destinations),
    [startDateDayjs, destinations]
  );

  useEffect(() => {
    if ((viewMode === 'carousel' || (viewMode === 'list' && layoutMode === 'desktop')) && destinations.length > 0) {
      setCurrentIndex(Math.min(currentIndex, destinations.length - 1));
    }
  }, [destinations.length, viewMode, layoutMode, currentIndex]);

  if (!currentTrip) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No trip selected</Typography>
      </Box>
    );
  }

  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch {
        // fallback for non-secure contexts
      }
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const handleAddDestination = (index?: number): void => {
    if (!currentTrip) return;
    const newDestination: DestinationType = {
      id: generateId(),
      name: '',
      displayName: '',
      nights: null,
    };
    setNewlyCreatedId(newDestination.id);
    const newDestinations = [...destinations];
    if (index !== undefined) {
      newDestinations.splice(index, 0, newDestination);
      if (viewMode === 'carousel') {
        setCurrentIndex(index);
      }
    } else {
      newDestinations.push(newDestination);
      if (viewMode === 'carousel') {
        setCurrentIndex(destinations.length);
      }
    }
    updateTrip({
      ...currentTrip,
      destinations: newDestinations,
    });
  };

  const handlePrevious = (): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (): void => {
    if (layoutMode === 'desktop' && viewMode === 'list') {
      setCurrentIndex((prev) => Math.min(Math.max(0, destinations.length - columns), prev + 1));
    } else {
      setCurrentIndex((prev) => Math.min(destinations.length - 1, prev + 1));
    }
  };

  const handleListPrevious = (): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleListNext = (): void => {
    setCurrentIndex((prev) => Math.min(Math.max(0, destinations.length - columns), prev + 1));
  };

  const handleDestinationChange = (updatedDestination: DestinationType): void => {
    if (!currentTrip) return;
    const updatedDestinations = destinations.map((dest) =>
      dest.id === updatedDestination.id ? updatedDestination : dest
    );
    updateTrip({
      ...currentTrip,
      destinations: updatedDestinations,
    });
    if (updatedDestination.id === newlyCreatedId) {
      setNewlyCreatedId(null);
    }
  };

  const handleStartDateChange = (date: Dayjs | null): void => {
    if (!currentTrip) return;
    updateTrip({
      ...currentTrip,
      startDate: date?.toISOString() ?? null,
    });
  };

  if (viewMode === 'carousel') {
    const hasDestinations = destinations.length > 0;

    if (layoutMode === 'desktop') {
      const totalSlots = maxAdjacent * 2 + 1;

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
            <SettingsCard
              startDate={tripStartDate}
              endDate={tripEndDate}
              onStartDateChange={handleStartDateChange}
              hasDateErrors={dateErrorsExist}
            />
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
                  disabled={currentIndex >= destinations.length - 1}
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
                  alignItems: 'stretch',
                  gap: 2,
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                  const relativeIndex = slotIndex - maxAdjacent;
                  const absoluteIndex = currentIndex + relativeIndex;

                  if (absoluteIndex < 0 || absoluteIndex >= destinations.length) {
                    return (
                      <Box
                        key={`empty-${slotIndex}`}
                        sx={{
                          width: '400px',
                          flexShrink: 0,
                        }}
                      />
                    );
                  }

                  const isCurrent = absoluteIndex === currentIndex;

                  return (
                    <Box
                      key={destinations[absoluteIndex].id}
                      sx={{
                        width: isCurrent ? '450px' : '400px',
                        flexShrink: 0,
                        opacity: isCurrent ? 1 : 0.6,
                        transform: isCurrent ? 'scale(1)' : 'scale(0.9)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Destination
                        destination={destinations[absoluteIndex]}
                        nextDestination={destinations[absoluteIndex + 1]}
                        onDestinationChange={handleDestinationChange}
                        shouldFocus={destinations[absoluteIndex].id === newlyCreatedId}
                        alwaysExpanded
                        isFirst={absoluteIndex === 0}
                        arrivalDate={destinationDates[absoluteIndex]?.arrivalDate ?? null}
                        departureDate={destinationDates[absoluteIndex]?.departureDate ?? null}
                        dateError={destinationDates[absoluteIndex]?.error}
                        layoutMode={layoutMode}
                        tripStartDate={tripStartDate}
                      />
                    </Box>
                  );
                })}
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
          <SettingsCard
            startDate={tripStartDate}
            endDate={tripEndDate}
            onStartDateChange={handleStartDateChange}
            hasDateErrors={dateErrorsExist}
          />
          <MapCard destinations={destinations} />
          {hasDestinations && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={() => handleAddDestination(currentIndex)}
                color="primary"
                size="small"
              >
                <AddIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  disabled={currentIndex >= destinations.length - 1}
                  color="primary"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
              <IconButton
                onClick={() => handleAddDestination(currentIndex + 1)}
                color="primary"
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Box>
          )}
          {hasDestinations ? (
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
              <Destination
                destination={destinations[currentIndex]}
                nextDestination={destinations[currentIndex + 1]}
                onDestinationChange={handleDestinationChange}
                shouldFocus={destinations[currentIndex].id === newlyCreatedId}
                alwaysExpanded
                isFirst={currentIndex === 0}
                arrivalDate={destinationDates[currentIndex]?.arrivalDate ?? null}
                departureDate={destinationDates[currentIndex]?.departureDate ?? null}
                dateError={destinationDates[currentIndex]?.error}
                layoutMode={layoutMode}
                tripStartDate={tripStartDate}
              />
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

  if (layoutMode === 'desktop' && viewMode === 'list') {
    const visibleDestinations = destinations.slice(currentIndex, currentIndex + columns);

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
          <SettingsCard
            startDate={tripStartDate}
            endDate={tripEndDate}
            onStartDateChange={handleStartDateChange}
            hasDateErrors={dateErrorsExist}
          />
          <MapCard destinations={destinations} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <IconButton
              onClick={handleListPrevious}
              disabled={currentIndex === 0}
              color="primary"
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2">
              {currentIndex + 1}-{Math.min(currentIndex + columns, destinations.length)} / {destinations.length}
            </Typography>
            <IconButton
              onClick={handleListNext}
              disabled={currentIndex + columns >= destinations.length}
              color="primary"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
            }}
          >
            {visibleDestinations.map((destination, relativeIndex) => {
              const absoluteIndex = currentIndex + relativeIndex;
              return (
                <Box
                  key={destination.id}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                  }}
                >
                  <Destination
                    destination={destination}
                    nextDestination={destinations[absoluteIndex + 1]}
                    onDestinationChange={handleDestinationChange}
                    shouldFocus={destination.id === newlyCreatedId}
                    alwaysExpanded
                    isFirst={absoluteIndex === 0}
                    arrivalDate={destinationDates[absoluteIndex]?.arrivalDate ?? null}
                    departureDate={destinationDates[absoluteIndex]?.departureDate ?? null}
                    dateError={destinationDates[absoluteIndex]?.error}
                    layoutMode={layoutMode}
                    tripStartDate={tripStartDate}
                  />
                </Box>
              );
            })}
          </Box>
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
        <SettingsCard
          startDate={tripStartDate}
          endDate={tripEndDate}
          onStartDateChange={handleStartDateChange}
          hasDateErrors={dateErrorsExist}
        />
        <MapCard destinations={destinations} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {destinations.map((destination, index) => (
            <Box key={destination.id} sx={{ minWidth: 0, overflow: 'hidden' }}>
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
                nextDestination={destinations[index + 1]}
                onDestinationChange={handleDestinationChange}
                shouldFocus={destination.id === newlyCreatedId}
                isFirst={index === 0}
                arrivalDate={destinationDates[index]?.arrivalDate ?? null}
                departureDate={destinationDates[index]?.departureDate ?? null}
                dateError={destinationDates[index]?.error}
                layoutMode={layoutMode}
                tripStartDate={tripStartDate}
              />
            </Box>
          ))}
        </Box>
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
