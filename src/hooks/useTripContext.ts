import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode, type ReactElement } from "react";
import dayjs from "dayjs";
import { type Trip } from "../types/trip";
import { useAuth } from "../contexts/AuthContext";
import { loadTrips, saveTrips, createTrip as createTripStorage } from "../services/storageService";
import { getTrips, createTripApi, updateTripApi, deleteTripApi } from "../services/tripsApi";
import { calculateTripEndDate, computeDestinationTimeline } from "../utils/dateCalculation";

interface TripContextType {
  trips: Trip[];
  currentTripId: string | null;
  currentTrip: Trip | null;
  editingTripId: string | null;
  tripsLoading: boolean;
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
    throw new Error("useTripContext must be used within TripContextProvider");
  }
  return context;
};

interface TripContextProviderProps {
  children: ReactNode;
}

export const TripContextProvider = ({ children }: TripContextProviderProps): ReactElement => {
  const { user, token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripsLoading, setTripsLoading] = useState(false);

  useEffect(() => {
    if (user === null) {
      const loadedTrips = loadTrips();
      if (loadedTrips.length === 0) {
        const newTrip = createTripStorage("Trip 1");
        const initialTrips = [newTrip];
        setTrips(initialTrips);
        setCurrentTripId(newTrip.id);
        saveTrips(initialTrips);
      } else {
        setTrips(loadedTrips);
        setCurrentTripId(loadedTrips[0].id);
      }
      return;
    }
    if (!user || !token) return;
    setTripsLoading(true);
    getTrips(token)
      .then((fetched) => {
        if (fetched.length === 0) {
          const newTrip = createTripStorage("Trip 1");
          setTrips([newTrip]);
          setCurrentTripId(newTrip.id);
          createTripApi(token, newTrip).then((saved) => {
            setTrips([saved]);
          }).catch(() => {});
        } else {
          setTrips(fetched);
          setCurrentTripId(fetched[0].id);
        }
      })
      .catch(() => {
        setTrips([]);
        setCurrentTripId(null);
      })
      .finally(() => {
        setTripsLoading(false);
      });
  }, [user, token]);

  useEffect(() => {
    if (user === null && trips.length > 0) {
      saveTrips(trips);
    }
  }, [user, trips]);

  const createTrip = useCallback((): Trip => {
    if (!user || !token) {
      const position = trips.length + 1;
      const newTrip = createTripStorage(`Trip ${position}`);
      setTrips((prev) => [...prev, newTrip]);
      setCurrentTripId(newTrip.id);
      setEditingTripId(newTrip.id);
      return newTrip;
    }
    const position = trips.length + 1;
    const newTrip = createTripStorage(`Trip ${position}`);
    setTrips((prev) => [...prev, newTrip]);
    setCurrentTripId(newTrip.id);
    setEditingTripId(newTrip.id);
    createTripApi(token, newTrip)
      .then((saved) => {
        setTrips((prev) => prev.map((t) => (t.id === newTrip.id ? saved : t)));
      })
      .catch(() => {
        setTrips((prev) => prev.filter((t) => t.id !== newTrip.id));
        if (currentTripId === newTrip.id && trips.length > 0) {
          setCurrentTripId(trips[0].id);
        }
      });
    return newTrip;
  }, [user, token, trips.length, currentTripId]);

  const updateTrip = useCallback((trip: Trip) => {
    const { destinationsWithTimeline } = computeDestinationTimeline(trip.startDate, trip.destinations);
    const endDate = calculateTripEndDate(trip.startDate, destinationsWithTimeline);
    const updatedTrip: Trip = {
      ...trip,
      destinations: destinationsWithTimeline,
      endDate,
      updatedAt: dayjs(),
    };
    if (!user || !token) {
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? updatedTrip : t)));
      return;
    }
    setTrips((prev) => prev.map((t) => (t.id === trip.id ? updatedTrip : t)));
    updateTripApi(token, updatedTrip).then((saved) => {
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? saved : t)));
    }).catch(() => {
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? trip : t)));
    });
  }, [user, token]);

  const deleteTrip = useCallback((id: string) => {
    if (!user || !token) {
      const updatedTrips = trips.filter((t) => t.id !== id);
      setTrips(updatedTrips);
      if (currentTripId === id) {
        if (updatedTrips.length > 0) {
          setCurrentTripId(updatedTrips[0].id);
        } else {
          const newTrip = createTripStorage("Trip 1");
          setTrips([newTrip]);
          setCurrentTripId(newTrip.id);
        }
      }
      return;
    }
    const updatedTrips = trips.filter((t) => t.id !== id);
    setTrips(updatedTrips);
    if (currentTripId === id) {
      setCurrentTripId(updatedTrips.length > 0 ? updatedTrips[0].id : null);
    }
    deleteTripApi(token, id).catch(() => {
      setTrips(trips);
      setCurrentTripId(currentTripId);
    });
  }, [user, token, trips, currentTripId]);

  const setCurrentTrip = useCallback((id: string | null) => {
    setCurrentTripId(id);
  }, []);

  const renameTrip = useCallback((id: string, name: string) => {
    const trip = trips.find((t) => t.id === id);
    if (trip) {
      updateTrip({ ...trip, name });
    }
  }, [trips, updateTrip]);

  const currentTrip = currentTripId ? trips.find((t) => t.id === currentTripId) ?? null : null;

  return React.createElement(
    TripContext.Provider,
    {
      value: {
        trips,
        currentTripId,
        currentTrip,
        editingTripId,
        tripsLoading,
        createTrip,
        updateTrip,
        deleteTrip,
        setCurrentTrip,
        renameTrip,
        setEditingTripId,
      },
    },
    children,
  );
};
