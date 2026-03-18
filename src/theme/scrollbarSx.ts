import type { Theme } from "@mui/material/styles";

export const getThemedScrollbarSx = (theme: Theme) => ({
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.palette.action.selected} ${theme.palette.background.paper}`,
  "&::-webkit-scrollbar": {
    width: 10,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.background.paper,
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: 999,
    backgroundColor: theme.palette.action.selected,
    border: `2px solid ${theme.palette.background.paper}`,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.action.active,
  },
});
