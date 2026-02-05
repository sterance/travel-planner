import { type ReactElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { type ArrivalWeatherBackgroundMode } from '../App';

interface OutletContext {
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
}

export const SettingsPage = (): ReactElement => {
  const { arrivalWeatherBackgroundMode, setArrivalWeatherBackgroundMode } = useOutletContext<OutletContext>();

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
                Arrival weather
              </Typography>
            }
          />
          <CardContent>
            <TextField
              select
              label="Background gradient"
              value={arrivalWeatherBackgroundMode}
              onChange={(e) => setArrivalWeatherBackgroundMode(e.target.value as ArrivalWeatherBackgroundMode)}
              size="small"
              sx={{ width: 260 }}
            >
              <MenuItem value="default">Default (follow page theme)</MenuItem>
              <MenuItem value="light">Force light</MenuItem>
              <MenuItem value="dark">Force dark</MenuItem>
            </TextField>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
