import { createContext, useContext, useState, useEffect, type ReactNode, type ReactElement } from 'react';
import { type Trip } from '../types/trip';
import { loadTrips, saveTrips, createTrip as createTripStorage } from '../services/tripStorageService';

interface TripContextType {
  trips: Trip[];
  currentTripId: string | null;
  currentTrip: Trip | null;
  editingTripId: string | null;
  createTrip: () => Trip;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  setCurrentTrip: (id: string | null) => void;
  renameTrip: (id: string, name: string) => void;
  setEditingTripId: (id: string | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTripContext = (): TripContextType => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within TripContextProvider');
  }
  return context;
};

interface TripContextProviderProps {
  children: ReactNode;
}

export const TripContextProvider = ({ children }: TripContextProviderProps): ReactElement => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  useEffect(() => {
    const loadedTrips = loadTrips();
    if (loadedTrips.length === 0) {
      const newTrip = createTripStorage('Trip 1');
      const initialTrips = [newTrip];
      setTrips(initialTrips);
      setCurrentTripId(newTrip.id);
      saveTrips(initialTrips);
    } else {
      setTrips(loadedTrips);
      setCurrentTripId(loadedTrips[0].id);
    }
  }, []);

  useEffect(() => {
    if (trips.length > 0) {
      saveTrips(trips);
    }
  }, [trips]);

  const createTrip = (): Trip => {
    const position = trips.length + 1;
    const newTrip = createTripStorage(`Trip ${position}`);
    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    setCurrentTripId(newTrip.id);
    setEditingTripId(newTrip.id);
    return newTrip;
  };

  const updateTrip = (trip: Trip): void => {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...trip, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTrip = (id: string): void => {
    const updatedTrips = trips.filter((t) => t.id !== id);
    setTrips(updatedTrips);
    if (currentTripId === id) {
      if (updatedTrips.length > 0) {
        setCurrentTripId(updatedTrips[0].id);
      } else {
        const newTrip = createTripStorage('Trip 1');
        setTrips([newTrip]);
        setCurrentTripId(newTrip.id);
      }
    }
  };

  const setCurrentTrip = (id: string | null): void => {
    setCurrentTripId(id);
  };

  const renameTrip = (id: string, name: string): void => {
    const trip = trips.find((t) => t.id === id);
    if (trip) {
      updateTrip({ ...trip, name });
    }
  };

  const currentTrip = currentTripId ? trips.find((t) => t.id === currentTripId) ?? null : null;

  return (
    <TripContext.Provider
      value={{
        trips,
        currentTripId,
        currentTrip,
        editingTripId,
        createTrip,
        updateTrip,
        deleteTrip,
        setCurrentTrip,
        renameTrip,
        setEditingTripId,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
