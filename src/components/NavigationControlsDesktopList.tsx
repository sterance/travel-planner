import { type ReactElement, forwardRef } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface NavigationControlsDesktopListProps {
  currentIndex: number;
  totalCount: number;
  visibleCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const NavigationControlsDesktopList = forwardRef<HTMLDivElement, NavigationControlsDesktopListProps>(function NavigationControlsDesktopList(
  { currentIndex, totalCount, visibleCount, onPrevious, onNext },
  ref
): ReactElement {
  const rangeStart = currentIndex + 1;
  const rangeEnd = Math.min(currentIndex + visibleCount, totalCount);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex + visibleCount >= totalCount;

  return (
    <Card
      ref={ref}
      sx={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper",
        elevation: 2,
        borderRadius: 2,
        mb: 2,
        px: 1.5,
        py: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={onPrevious} disabled={isPrevDisabled} color="primary" size="large">
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="body2"
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              minWidth: "4em",
              textAlign: "center",
            }}
          >
            {rangeStart}-{rangeEnd} / {totalCount}
          </Typography>
          <IconButton onClick={onNext} disabled={isNextDisabled} color="primary" size="large">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, justifyContent: "center", flexWrap: "wrap", maxWidth: 320 }}>
          {Array.from({ length: totalCount }, (_, index) => {
            const isInVisibleRange = index >= currentIndex && index < currentIndex + visibleCount;
            return (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: isInVisibleRange ? "primary.main" : "action.selected",
                  ...(isInVisibleRange && { transform: "scale(1.25)" }),
                }}
              />
            );
          })}
        </Box>
      </Box>
    </Card>
  );
});
