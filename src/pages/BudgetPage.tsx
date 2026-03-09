import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Typography, TextField, Box, Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import { useTripContext } from "../hooks/useTripContext";
import type { Destination } from "../types/destination";
import type { Trip } from "../types/trip";
import CircularProgress from "@mui/material/CircularProgress";
import { formatTransportMode } from "../utils/itineraryFormatters";

interface MoneyInputProps {
  value: number;
  onChange: (v: number) => void;
}

interface OtherItem {
  id: string;
  label: string;
  cost: number;
  paid: boolean;
}

const MoneyInput = ({ value, onChange }: MoneyInputProps) => {
  const displayValue =
    Number.isFinite(value) && value !== 0 ? value.toFixed(2) : "";

  return (
    <TextField
      type="number"
      size="small"
      slotProps={{
        htmlInput: { step: 0.01, min: 0 },
        input: { startAdornment: <span style={{ marginRight: 4 }}>$</span> }
      }}
      value={displayValue}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      sx={{
        width: 100,
        "& .MuiOutlinedInput-root": {
          height: 32,
        },
        "& input[type=number]": {
          MozAppearance: "textfield",
        },
        "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
      }}
    />
  );
};

interface DestinationBudgetTableProps {
  destination: Destination;
  outboundMode?: string;
  showOnwards?: boolean;
  onTotalChange?: (id: string, total: number) => void;
  onPlannedTotalChange?: (id: string, plannedTotal: number) => void;
}

const DestinationBudgetTable = ({
  destination,
  outboundMode,
  showOnwards,
  onTotalChange,
  onPlannedTotalChange,
}: DestinationBudgetTableProps) => {
  // Accommodation costs
  const [accommodationCosts, setAccommodationCosts] = useState(
    (destination.accommodations || []).map(() => 0)
  );
  // Activity costs
  const [activityCosts, setActivityCosts] = useState(
    (destination.activities || []).map(() => 0)
  );
  const [accommodationPaid, setAccommodationPaid] = useState(
    (destination.accommodations || []).map(() => false)
  );
  const [activityPaid, setActivityPaid] = useState(
    (destination.activities || []).map(() => false)
  );
  // Other costs
  const [otherItems, setOtherItems] = useState<OtherItem[]>([]);
  const [editingOtherId, setEditingOtherId] = useState<string | null>(null);
  const [editingOtherLabel, setEditingOtherLabel] = useState("");
  const [hoveredOtherId, setHoveredOtherId] = useState<string | null>(null);
  // Onwards transport cost
  const [onwardsCost, setOnwardsCost] = useState(0);
  const [onwardsPaid, setOnwardsPaid] = useState(false);

  const handleAccommodationChange = (idx: number, val: number) => {
    setAccommodationCosts(costs => costs.map((c, i) => (i === idx ? val : c)));
  };
  const handleActivityChange = (idx: number, val: number) => {
    setActivityCosts(costs => costs.map((c, i) => (i === idx ? val : c)));
  };

  const handleAccommodationPaidChange = (idx: number, checked: boolean) => {
    setAccommodationPaid(flags => flags.map((f, i) => (i === idx ? checked : f)));
  };

  const handleActivityPaidChange = (idx: number, checked: boolean) => {
    setActivityPaid(flags => flags.map((f, i) => (i === idx ? checked : f)));
  };

  const handleAddOther = () => {
    const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    const newItem: OtherItem = {
      id,
      label: "",
      cost: 0,
      paid: false,
    };
    setOtherItems(items => [...items, newItem]);
    setEditingOtherId(id);
    setEditingOtherLabel("");
  };

  const handleOtherCostChange = (id: string, val: number) => {
    setOtherItems(items =>
      items.map(item => (item.id === id ? { ...item, cost: val } : item)),
    );
  };

  const handleOtherLabelSave = (id: string) => {
    const trimmed = editingOtherLabel.trim();
    setOtherItems(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              label: trimmed || item.label,
            }
          : item,
      ),
    );
    setEditingOtherId(null);
    setEditingOtherLabel("");
  };

  const handleOtherLabelCancel = () => {
    setEditingOtherId(null);
    setEditingOtherLabel("");
  };

  const handleRemoveOther = (id: string) => {
    setOtherItems(items => items.filter(item => item.id !== id));
    setHoveredOtherId(current => (current === id ? null : current));
    setEditingOtherId(current => (current === id ? null : current));
    setEditingOtherLabel("");
  };

  const totalCost =
    accommodationCosts.reduce((sum, val) => sum + val, 0) +
    activityCosts.reduce((sum, val) => sum + val, 0) +
    otherItems.reduce((sum, item) => sum + item.cost, 0) +
    onwardsCost;

  const plannedTotal =
    accommodationCosts.reduce(
      (sum, val, idx) => sum + (accommodationPaid[idx] ? 0 : val),
      0,
    ) +
    activityCosts.reduce(
      (sum, val, idx) => sum + (activityPaid[idx] ? 0 : val),
      0,
    ) +
    otherItems.reduce(
      (sum, item) => sum + (item.paid ? 0 : item.cost),
      0,
    ) +
    (onwardsPaid ? 0 : onwardsCost);

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(destination.id, totalCost);
    }
  }, [onTotalChange, destination.id, totalCost]);

  useEffect(() => {
    if (onPlannedTotalChange) {
      onPlannedTotalChange(destination.id, plannedTotal);
    }
  }, [onPlannedTotalChange, destination.id, plannedTotal]);

  return (
    <Card sx={{ p: 1, my: 2, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 1 }}>{destination.displayName || destination.name}</Typography>
      <Table size="small" sx={{ "& td": { pr: 1 } }}>
        <TableBody>
          {/* Accommodation Section */}
          {(destination.accommodations || []).length > 0 && (
            <TableRow>
              <TableCell colSpan={3} sx={{ fontWeight: 600, pt: 2 }}>Accommodation</TableCell>
            </TableRow>
          )}
          {(destination.accommodations || []).map((acc, idx) => (
            <TableRow key={acc.id || idx}>
              <TableCell>{acc.name || `accommodation ${idx + 1}`}</TableCell>
              <TableCell align="right">
                <MoneyInput value={accommodationCosts[idx]} onChange={val => handleAccommodationChange(idx, val)} />
              </TableCell>
              <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                <Tooltip title={accommodationPaid[idx] ? "Paid" : "Planned"}>
                  <Checkbox
                    size="small"
                    checked={accommodationPaid[idx]}
                    onChange={e => handleAccommodationPaidChange(idx, e.target.checked)}
                    slotProps={{
                      input: {
                        "aria-label": `${acc.name || `accommodation ${idx + 1}`} ${accommodationPaid[idx] ? "Paid" : "Planned"}`,
                      },
                    }}
                  />
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}

          {/* Activities Section */}
          {(destination.activities || []).length > 0 && (
            <TableRow>
              <TableCell colSpan={3} sx={{ fontWeight: 600, pt: 2 }}>Activities</TableCell>
            </TableRow>
          )}
          {(destination.activities || []).map((act, idx) => (
            <TableRow key={act.id || idx}>
              <TableCell>{act.name || `activity ${idx + 1}`}</TableCell>
              <TableCell align="right">
                <MoneyInput value={activityCosts[idx]} onChange={val => handleActivityChange(idx, val)} />
              </TableCell>
              <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                <Tooltip title={activityPaid[idx] ? "Paid" : "Planned"}>
                  <Checkbox
                    size="small"
                    checked={activityPaid[idx]}
                    onChange={e => handleActivityPaidChange(idx, e.target.checked)}
                    slotProps={{
                      input: {
                        "aria-label": `${act.name || `activity ${idx + 1}`} ${activityPaid[idx] ? "Paid" : "Planned"}`,
                      },
                    }}
                  />
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}

          {/* Other Section */}
          {otherItems.length > 0 && (
            <TableRow>
              <TableCell colSpan={3} sx={{ fontWeight: 600, pt: 2 }}>Other</TableCell>
            </TableRow>
          )}
          {otherItems.map((item) => {
            const isEditing = editingOtherId === item.id;
            const isHovered = hoveredOtherId === item.id;

            return (
              <TableRow
                key={item.id}
                onMouseEnter={() => setHoveredOtherId(item.id)}
                onMouseLeave={() => setHoveredOtherId(current => (current === item.id ? null : current))}
              >
                <TableCell>
                  {isEditing ? (
                    <TextField
                      value={editingOtherLabel}
                      onChange={e => setEditingOtherLabel(e.target.value)}
                      onBlur={() => handleOtherLabelSave(item.id)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          handleOtherLabelSave(item.id);
                        } else if (e.key === "Escape") {
                          handleOtherLabelCancel();
                        }
                      }}
                      size="small"
                      variant="standard"
                      fullWidth
                    />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography variant="body2">
                        {item.label}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingOtherId(item.id);
                            setEditingOtherLabel(item.label);
                          }}
                          sx={{
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveOther(item.id)}
                          sx={{
                            opacity: isHovered ? 1 : 0,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <MoneyInput
                    value={item.cost}
                    onChange={val => handleOtherCostChange(item.id, val)}
                  />
                </TableCell>
                <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                  <Tooltip title={item.paid ? "Paid" : "Planned"}>
                    <Checkbox
                      size="small"
                      checked={item.paid}
                      onChange={e =>
                        setOtherItems(items =>
                          items.map(other =>
                            other.id === item.id ? { ...other, paid: e.target.checked } : other,
                          ),
                        )
                      }
                      slotProps={{
                        input: {
                          "aria-label": `${item.label || "other item"} ${item.paid ? "Paid" : "Planned"}`,
                        },
                      }}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell>
              <IconButton
                size="small"
                onClick={handleAddOther}
                color="primary"
                sx={{ px: 0 }}
              >
                <AddIcon fontSize="small" /> 
                <Typography variant="body2">Add</Typography>
              </IconButton>
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>

          {/* Onwards Section */}
          {showOnwards && destination.transportDetails && (
            (() => {
              const mode =
                outboundMode ||
                destination.transportDetails?.mode ||
                "";
              const from = destination.transportDetails.departureLocation || "?";
              const to = destination.transportDetails.arrivalLocation || "?";
              const hasLocations =
                (destination.transportDetails.departureLocation ?? "") !== "" ||
                (destination.transportDetails.arrivalLocation ?? "") !== "";

              let label: string;
              if (!hasLocations && mode) {
                label = formatTransportMode(mode);
              } else {
                const prefix = mode ? `${formatTransportMode(mode)}: ` : "";
                label = `${prefix}${from} ￫ ${to}`;
              }

              return (
                <>
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: 600, pt: 2 }}>Onwards</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {label}
                    </TableCell>
                    <TableCell align="right">
                      <MoneyInput value={onwardsCost} onChange={setOnwardsCost} />
                    </TableCell>
                    <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                      <Tooltip title={onwardsPaid ? "Paid" : "Planned"}>
                        <Checkbox
                          size="small"
                          checked={onwardsPaid}
                          onChange={e => setOnwardsPaid(e.target.checked)}
                          slotProps={{
                            input: {
                              "aria-label": `onwards ${onwardsPaid ? "Paid" : "Planned"}`,
                            },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </>
              );
            })()
          )}
        </TableBody>
      </Table>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
          px: 1,
        }}
      >
        <Typography variant="h6">
          {destination.displayName || destination.name} total:
        </Typography>
        <Typography variant="h6">
          ${totalCost.toFixed(2)}
        </Typography>
      </Box>
      
    </Card>
  );
};

export function BudgetPage({ trip }: { trip?: Trip }) {
  const { currentTrip, tripsLoading } = useTripContext();
  const usedTrip = trip ?? currentTrip;
  const [destinationTotals, setDestinationTotals] = useState<Record<string, number>>({});
  const [plannedTotals, setPlannedTotals] = useState<Record<string, number>>({});

  if (tripsLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!usedTrip) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No trip selected
        </Typography>
      </Box>
    );
  }

  const destinations = usedTrip.destinations || [];

  const handleDestinationTotalChange = (id: string, total: number) => {
    setDestinationTotals(prev =>
      prev[id] === total ? prev : { ...prev, [id]: total },
    );
  };

  const handlePlannedTotalChange = (id: string, plannedTotal: number) => {
    setPlannedTotals(prev =>
      prev[id] === plannedTotal ? prev : { ...prev, [id]: plannedTotal },
    );
  };

  const outstandingTotal = destinations.reduce(
    (sum, dest) => sum + (plannedTotals[dest.id] ?? 0),
    0,
  );

  const grandTotal = destinations.reduce(
    (sum, dest) => sum + (destinationTotals[dest.id] ?? 0),
    0,
  );

  return (
    <>
      {destinations.length === 0 ? (
        <Card sx={{ p: 1, my: 2, maxWidth: 600, mx: "auto" }}>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No destinations added yet
          </Typography>
        </Card>
      ) : (
        <>
          {destinations.map((dest: Destination, index: number) => (
            <DestinationBudgetTable
              key={dest.id}
              destination={dest}
              outboundMode={destinations[index + 1]?.transportDetails?.mode}
              showOnwards={index < destinations.length - 1}
              onTotalChange={handleDestinationTotalChange}
              onPlannedTotalChange={handlePlannedTotalChange}
            />
          ))}
          <Card sx={{ p: 1, my: 2, maxWidth: 600, mx: "auto" }}>
            <Table size="small">
              <TableBody>
                {destinations.map(dest => (
                  <TableRow key={dest.id}>
                    <TableCell>
                      {dest.displayName || dest.name}
                    </TableCell>
                    <TableCell align="right">
                      ${ (destinationTotals[dest.id] ?? 0).toFixed(2) }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                px: 1,
              }}
            >
              <Typography variant="h6">
                Outstanding:
              </Typography>
              <Typography variant="h6">
                ${outstandingTotal.toFixed(2)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
                px: 1,
              }}
            >
              <Typography variant="h6">
                Total:
              </Typography>
              <Typography variant="h6">
                ${grandTotal.toFixed(2)}
              </Typography>
            </Box>
            
          </Card>
        </>
      )}
    </>
  );
}
