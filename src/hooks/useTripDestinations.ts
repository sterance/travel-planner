import { useState } from "react";
import { type Dayjs } from "dayjs";
import { type Destination as DestinationType } from "../types/destination";
import { type Trip } from "../types/trip";
import { type ViewMode, type LayoutMode } from "../App";

interface UseTripDestinationsParams {
  currentTrip: Trip | null;
  updateTrip: (trip: Trip) => void;
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
}

interface UseTripDestinationsResult {
  destinations: DestinationType[];
  newlyCreatedId: string | null;
  setNewlyCreatedId: (id: string | null) => void;
  currentIndex: number;
  setCurrentIndex: (update: number | ((prev: number) => number)) => void;
  reorderDragOverIndex: number | null;
  setReorderDragOverIndex: (index: number | null) => void;
  handleAddDestination: (index?: number) => void;
  handleRemoveDestination: (destinationId: string) => void;
  handleDestinationChange: (updatedDestination: DestinationType) => void;
  handleReorderDragStart: (e: React.DragEvent, id: string) => void;
  handleReorderDragOver: (e: React.DragEvent, index: number) => void;
  handleReorderDrop: (e: React.DragEvent, toIndex: number) => void;
  handleReorderDragEnd: () => void;
  handleStartDateChange: (date: Dayjs | null) => void;
}

const generateId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // ignore and fall back
    }
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const useTripDestinations = ({ currentTrip, updateTrip, viewMode, layoutMode, columns }: UseTripDestinationsParams): UseTripDestinationsResult => {
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reorderDragOverIndex, setReorderDragOverIndex] = useState<number | null>(null);

  const destinations = currentTrip?.destinations ?? [];
  const isDesktopList = layoutMode === "desktop" && viewMode === "list";
  const desktopListColumns = isDesktopList ? Math.max(columns, 3) : columns;

  const handleAddDestination = (index?: number): void => {
    if (!currentTrip) return;
    const newDestination: DestinationType = {
      id: generateId(),
      name: "",
      displayName: "",
      nights: null,
    };
    setNewlyCreatedId(newDestination.id);
    const newDestinations = [...destinations];
    if (index !== undefined) {
      newDestinations.splice(index, 0, newDestination);
      if (viewMode === "carousel") {
        setCurrentIndex(index);
      }
    } else {
      newDestinations.push(newDestination);
      if (viewMode === "carousel") {
        setCurrentIndex(destinations.length);
      } else if (isDesktopList && destinations.length >= desktopListColumns && currentIndex + desktopListColumns === destinations.length) {
        setCurrentIndex((prev) => Math.min(Math.max(0, newDestinations.length - desktopListColumns), prev + 1));
      }
    }
    updateTrip({
      ...currentTrip,
      destinations: newDestinations,
    });
  };

  const handleDestinationChange = (updatedDestination: DestinationType): void => {
    if (!currentTrip) return;

    const updatedIndex = destinations.findIndex((dest) => dest.id === updatedDestination.id);
    const updatedDestinations = destinations.map((dest) => (dest.id === updatedDestination.id ? updatedDestination : dest));

    if (updatedIndex !== -1 && updatedIndex < destinations.length - 1) {
      const nextDestination = updatedDestinations[updatedIndex + 1];
      const arrivalDateTime = updatedDestination.transportDetails?.arrivalDateTime;

      if (arrivalDateTime && nextDestination) {
        updatedDestinations[updatedIndex + 1] = {
          ...nextDestination,
          arrivalTime: arrivalDateTime,
        };
      }
    }

    updateTrip({
      ...currentTrip,
      destinations: updatedDestinations,
    });
    if (updatedDestination.id === newlyCreatedId) {
      setNewlyCreatedId(null);
    }
  };

  const handleRemoveDestination = (destinationId: string): void => {
    if (!currentTrip) return;
    const removedIndex = destinations.findIndex((d) => d.id === destinationId);
    if (removedIndex === -1) return;
    const newDestinations = destinations.filter((d) => d.id !== destinationId);
    if (currentIndex === removedIndex) {
      setCurrentIndex(Math.max(0, removedIndex - 1));
    } else if (currentIndex > removedIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
    updateTrip({
      ...currentTrip,
      destinations: newDestinations,
    });
  };

  const handleReorderDragStart = (e: React.DragEvent, id: string): void => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setReorderDragOverIndex(index);
  };

  const handleReorderDrop = (e: React.DragEvent, toIndex: number): void => {
    e.preventDefault();
    setReorderDragOverIndex(null);
    if (!currentTrip) return;
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const fromIndex = destinations.findIndex((d) => d.id === id);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const newDestinations = [...destinations];
    newDestinations[fromIndex] = newDestinations[toIndex];
    newDestinations[toIndex] = destinations[fromIndex];
    updateTrip({ ...currentTrip, destinations: newDestinations });
  };

  const handleReorderDragEnd = (): void => {
    setReorderDragOverIndex(null);
  };

  const handleStartDateChange = (date: Dayjs | null): void => {
    if (!currentTrip) return;
    updateTrip({
      ...currentTrip,
      startDate: date,
    });
  };

  return {
    destinations,
    newlyCreatedId,
    setNewlyCreatedId,
    currentIndex,
    setCurrentIndex,
    reorderDragOverIndex,
    setReorderDragOverIndex,
    handleAddDestination,
    handleRemoveDestination,
    handleDestinationChange,
    handleReorderDragStart,
    handleReorderDragOver,
    handleReorderDrop,
    handleReorderDragEnd,
    handleStartDateChange,
  };
};

