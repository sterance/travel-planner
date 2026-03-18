import { type ReactElement, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ArticleIcon from "@mui/icons-material/Article";
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { ItineraryPage } from "./ItineraryPage";
import { BudgetPage } from "./BudgetPage";
import { CalendarPage } from "./CalendarPage";
import { type Trip } from "../types/trip";

type Tab = "itinerary" | "budget" | "calendar";

interface SummaryPageProps {
  trip?: Trip | null;
  onUpdateTrip?: (trip: Trip) => void;
}

export const SummaryPage = ({ trip, onUpdateTrip }: SummaryPageProps): ReactElement => {
  const [tab, setTab] = useState<Tab>("itinerary");

  return (
    <Box sx={{ p: 1 }}>
      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={(_e, value: Tab | null) => {
          if (value !== null) setTab(value);
        }}
        sx={{ width: "100%" }}
      >
        <ToggleButton value="itinerary" aria-label="itinerary" sx={{ flex: 1, gap: 1 }}>
          <ArticleIcon />
          itinerary
        </ToggleButton>
        <ToggleButton value="budget" aria-label="budget" sx={{ flex: 1, gap: 1 }}>
          <CurrencyExchangeOutlinedIcon />
          budget
        </ToggleButton>
        <ToggleButton value="calendar" aria-label="calendar" sx={{ flex: 1, gap: 1 }}>
          <CalendarMonthOutlinedIcon />
          calendar
        </ToggleButton>
      </ToggleButtonGroup>

      {tab === "itinerary" && <ItineraryPage trip={trip ?? undefined} />}
      {tab === "budget" && <BudgetPage trip={trip ?? undefined} onUpdateTrip={onUpdateTrip} />}
      {tab === "calendar" && <CalendarPage trip={trip ?? undefined} onUpdateTrip={onUpdateTrip} />}
    </Box>
  );
};