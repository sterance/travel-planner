import { type ReactElement } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface NavigationControlsCarouselProps {
  currentIndex: number;
  stepCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddBefore?: () => void;
  onAddAfter?: () => void;
}

export const NavigationControlsCarousel = ({
  currentIndex,
  stepCount,
  onPrevious,
  onNext,
  onAddBefore,
  onAddAfter,
}: NavigationControlsCarouselProps): ReactElement => {
  const isLast = currentIndex >= stepCount - 1;
  return (
    <Card
      sx={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.paper",
        elevation: 2,
        borderRadius: 2,
        minWidth: "400px",
        px: 1.5,
        py: 1,
      }}
    >
      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", alignItems: "center", minWidth: 0 }}>
        {onAddBefore != null && (
          <IconButton onClick={onAddBefore} color="primary" size="small" aria-label="add before">
            <AddIcon sx={{ fontSize: "1.1rem" }} />
            <Typography component="span" variant="body2" sx={{ ml: 0.25, fontSize: "1.2rem" }}>
              Before
            </Typography>
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={onPrevious} disabled={currentIndex === 0} color="primary" size="large">
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
              minWidth: "2.5em",
              textAlign: "center",
            }}
          >
            {currentIndex + 1} / {stepCount}
          </Typography>
          <IconButton onClick={onNext} disabled={currentIndex >= stepCount - 1} color="primary" size="large">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, justifyContent: "center" }}>
          {Array.from({ length: stepCount }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: index === currentIndex ? "primary.main" : "action.selected",
                ...(index === currentIndex && { transform: "scale(1.25)" }),
              }}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", minWidth: 0 }}>
        {onAddAfter != null &&
          (isLast ? (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddAfter} sx={{ fontSize: "1.1rem" }}>
              New
            </Button>
          ) : (
            <IconButton onClick={onAddAfter} color="primary" size="small" aria-label="add after">
              <Typography component="span" variant="body2" sx={{ mr: 0.25, fontSize: "1.2rem" }}>
                After
              </Typography>
              <AddIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          ))}
      </Box>
    </Card>
  );
};
