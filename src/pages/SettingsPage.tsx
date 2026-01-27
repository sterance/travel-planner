import { type ReactElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';

interface OutletContext {
  columns: number;
  setColumns: (value: number) => void;
  maxAdjacent: number;
  setMaxAdjacent: (value: number) => void;
}

export const SettingsPage = (): ReactElement => {
  const { columns, setColumns, maxAdjacent, setMaxAdjacent } = useOutletContext<OutletContext>();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h5" component="div">
                Desktop Layout Settings
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <TextField
                value={columns}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 3) {
                    setColumns(value);
                  }
                }}
                label="Columns"
                type="number"
                size="small"
                sx={{ width: 120 }}
                slotProps={{
                  htmlInput: { min: 3 },
                }}
              />
              <TextField
                value={maxAdjacent}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 0) {
                    setMaxAdjacent(value);
                  }
                }}
                label="Max Adjacent"
                type="number"
                size="small"
                sx={{ width: 120 }}
                slotProps={{
                  htmlInput: { min: 0 },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
