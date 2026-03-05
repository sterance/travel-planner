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

type Tab = "itinerary" | "budget" | "calendar";

const tabContent: Record<Tab, ReactElement> = {
  itinerary: <ItineraryPage />,
  budget: <BudgetPage />,
  calendar: <CalendarPage />,
};

export const SummaryPage = (): ReactElement => {
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

      {tabContent[tab]}
    </Box>
  );
};