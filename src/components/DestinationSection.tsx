import type { ReactElement, ReactNode } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface DestinationSectionProps {
  title: string;
  children: ReactNode;
}

export const DestinationSection = ({
  title,
  children,
}: DestinationSectionProps): ReactElement => {
  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        }
        sx={{ py: 0 }}
      />
      <CardContent>
        <Typography variant="body1" component="div">
          {children}
        </Typography>
      </CardContent>
    </Card>
  );
};
