import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Typography, TextField, Box, Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
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
import {
  buildCurrencyOptions,
  formatCurrencySymbol,
  formatCurrencyAmount,
  getCurrencyExponent,
  getDestinationCurrency,
  createDineroFromDecimal,
  dineroToDecimal,
  createZeroDinero,
  type CurrencyOption,
} from "../utils/currency";
import { toSnapshot, type Dinero } from "dinero.js";

interface MoneyInputProps {
  value: Dinero<number> | null | undefined;
  onChange: (v: Dinero<number> | null) => void;
  currencyCode?: string;
}

const MoneyInput = ({ value, onChange, currencyCode = "USD" }: MoneyInputProps) => {
  const exponent = getCurrencyExponent(currencyCode);
  const decimal = value ? dineroToDecimal(value) : null;
  const displayValue = decimal == null ? "" : exponent === 0 ? String(Math.round(decimal)) : decimal.toFixed(exponent);
  const symbol = formatCurrencySymbol(currencyCode);

  return (
    <TextField
      type="number"
      size="small"
      slotProps={{
        htmlInput: { step: exponent === 0 ? 1 : Math.pow(10, -exponent), min: 0 },
        input: { startAdornment: <span style={{ marginRight: 4 }}>{symbol}</span> }
      }}
      value={displayValue}
      onChange={(e) => {
        const raw = e.target.value;
        if (!raw.trim()) {
          onChange(null);
          return;
        }
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
          onChange(null);
          return;
        }
        onChange(createDineroFromDecimal(parsed, currencyCode));
      }}
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
  homeCurrency: string;
  outboundMode?: string;
  showOnwards?: boolean;
  onTotalChange?: (id: string, total: number) => void;
  onPlannedTotalChange?: (id: string, plannedTotal: number) => void;
  onDestinationChange: (updated: Destination) => void;
}

const DestinationBudgetTable = ({
  destination,
  homeCurrency,
  outboundMode,
  showOnwards,
  onTotalChange,
  onPlannedTotalChange,
  onDestinationChange,
}: DestinationBudgetTableProps) => {
  const destCurrency = getDestinationCurrency(destination.placeDetails?.countryCode);
  const fallback = destCurrency ?? homeCurrency;
  const selectedCurrency = destination.destinationCurrency
    ? toSnapshot(destination.destinationCurrency).currency.code
    : fallback;

  useEffect(() => {
    if (destination.destinationCurrency) return;
    const initial = createZeroDinero(selectedCurrency);
    if (!initial) return;
    onDestinationChange({ ...destination, destinationCurrency: initial });
  }, [destination, selectedCurrency, onDestinationChange]);

  const currencyOptions = buildCurrencyOptions(
    homeCurrency,
    destination.placeDetails?.countryCode
  );
  const selectedOption = currencyOptions.find((c) => c.code === selectedCurrency) ?? currencyOptions[0];

  const otherItems = destination.customBudgetItems ?? [];
  const [editingOtherId, setEditingOtherId] = useState<string | null>(null);
  const [editingOtherLabel, setEditingOtherLabel] = useState("");
  const [hoveredOtherId, setHoveredOtherId] = useState<string | null>(null);

  const updateAccommodations = (updater: (current: NonNullable<Destination["accommodations"]>) => NonNullable<Destination["accommodations"]>) => {
    const current = destination.accommodations ?? [];
    onDestinationChange({ ...destination, accommodations: updater(current) });
  };

  const updateActivities = (updater: (current: NonNullable<Destination["activities"]>) => NonNullable<Destination["activities"]>) => {
    const current = destination.activities ?? [];
    onDestinationChange({ ...destination, activities: updater(current) });
  };

  const handleAddOther = () => {
    const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    const newItem = {
      id,
      label: "",
      costs: null,
      paid: false,
    };
    onDestinationChange({ ...destination, customBudgetItems: [...otherItems, newItem] });
    setEditingOtherId(id);
    setEditingOtherLabel("");
  };

  const handleOtherCostChange = (id: string, val: Dinero<number> | null) => {
    onDestinationChange({
      ...destination,
      customBudgetItems: otherItems.map((item) => (item.id === id ? { ...item, costs: val } : item)),
    });
  };

  const handleOtherLabelSave = (id: string) => {
    const trimmed = editingOtherLabel.trim();
    onDestinationChange({
      ...destination,
      customBudgetItems: otherItems.map((item) =>
        item.id === id
          ? {
              ...item,
              label: trimmed || item.label,
            }
          : item,
      ),
    });
    setEditingOtherId(null);
    setEditingOtherLabel("");
  };

  const handleOtherLabelCancel = () => {
    setEditingOtherId(null);
    setEditingOtherLabel("");
  };

  const handleRemoveOther = (id: string) => {
    onDestinationChange({ ...destination, customBudgetItems: otherItems.filter((item) => item.id !== id) });
    setHoveredOtherId(current => (current === id ? null : current));
    setEditingOtherId(current => (current === id ? null : current));
    setEditingOtherLabel("");
  };

  const totalCost = (
    (destination.accommodations ?? []).reduce((sum, a) => sum + (a.costs ? dineroToDecimal(a.costs) : 0), 0) +
    (destination.activities ?? []).reduce((sum, a) => sum + (a.costs ? dineroToDecimal(a.costs) : 0), 0) +
    otherItems.reduce((sum, item) => sum + (item.costs ? dineroToDecimal(item.costs) : 0), 0) +
    (destination.transportDetails?.costs ? dineroToDecimal(destination.transportDetails.costs) : 0)
  );

  const plannedTotal = (
    (destination.accommodations ?? []).reduce(
      (sum, a) => sum + (a.paid === true ? 0 : a.costs ? dineroToDecimal(a.costs) : 0),
      0,
    ) +
    (destination.activities ?? []).reduce(
      (sum, a) => sum + (a.paid === true ? 0 : a.costs ? dineroToDecimal(a.costs) : 0),
      0,
    ) +
    otherItems.reduce(
      (sum, item) => sum + (item.paid ? 0 : item.costs ? dineroToDecimal(item.costs) : 0),
      0,
    ) +
    (destination.transportDetails?.paid === true ? 0 : destination.transportDetails?.costs ? dineroToDecimal(destination.transportDetails.costs) : 0)
  );

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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", my: 1, gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h5">{destination.displayName || destination.name}</Typography>
        <Autocomplete
          size="small"
          options={currencyOptions}
          getOptionLabel={(option: CurrencyOption) => `${option.code} -- ${option.name}`}
          value={selectedOption}
          onChange={(_, newValue) => {
            if (!newValue) return;
            const next = createZeroDinero(newValue.code);
            if (!next) return;
            onDestinationChange({ ...destination, destinationCurrency: next });
          }}
          isOptionEqualToValue={(option, value) => option.code === value.code}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Currency"
              slotProps={{
                htmlInput: {
                  ...params.inputProps,
                  value: selectedOption ? selectedOption.code : "",
                  style: {
                    ...(typeof params.inputProps?.style === "object" && params.inputProps.style),
                    overflow: "visible",
                    textOverflow: "clip",
                    minWidth: "3em",
                  },
                },
              }}
              sx={{
                "& .MuiInputBase-input": {
                  overflow: "visible !important",
                  textOverflow: "clip !important",
                },
              }}
            />
          )}
          sx={{
            minWidth: 100,
            flexShrink: 0,
            "& .MuiInputBase-root": { overflow: "visible" },
            "& .MuiInputBase-input": { overflow: "visible !important", textOverflow: "clip !important" },
          }}
        />
      </Box>
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
                <MoneyInput
                  value={acc.costs}
                  onChange={(val) =>
                    updateAccommodations((current) =>
                      current.map((a, i) => (i === idx ? { ...a, costs: val } : a)),
                    )
                  }
                  currencyCode={selectedCurrency}
                />
              </TableCell>
              <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                <Tooltip title={acc.paid === true ? "Paid" : "Planned"}>
                  <Checkbox
                    size="small"
                    checked={acc.paid === true}
                    onChange={(e) =>
                      updateAccommodations((current) =>
                        current.map((a, i) => (i === idx ? { ...a, paid: e.target.checked } : a)),
                      )
                    }
                    slotProps={{
                      input: {
                        "aria-label": `${acc.name || `accommodation ${idx + 1}`} ${acc.paid === true ? "Paid" : "Planned"}`,
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
                <MoneyInput
                  value={act.costs}
                  onChange={(val) =>
                    updateActivities((current) =>
                      current.map((a, i) => (i === idx ? { ...a, costs: val } : a)),
                    )
                  }
                  currencyCode={selectedCurrency}
                />
              </TableCell>
              <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                <Tooltip title={act.paid === true ? "Paid" : "Planned"}>
                  <Checkbox
                    size="small"
                    checked={act.paid === true}
                    onChange={(e) =>
                      updateActivities((current) =>
                        current.map((a, i) => (i === idx ? { ...a, paid: e.target.checked } : a)),
                      )
                    }
                    slotProps={{
                      input: {
                        "aria-label": `${act.name || `activity ${idx + 1}`} ${act.paid === true ? "Paid" : "Planned"}`,
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
                    value={item.costs}
                    onChange={(val) => handleOtherCostChange(item.id, val)}
                    currencyCode={selectedCurrency}
                  />
                </TableCell>
                <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                  <Tooltip title={item.paid ? "Paid" : "Planned"}>
                    <Checkbox
                      size="small"
                      checked={item.paid}
                      onChange={(e) =>
                        onDestinationChange({
                          ...destination,
                          customBudgetItems: otherItems.map((other) =>
                            other.id === item.id ? { ...other, paid: e.target.checked } : other,
                          ),
                        })
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
                      <MoneyInput
                        value={destination.transportDetails?.costs}
                        onChange={(val) => {
                          if (!destination.transportDetails) return;
                          onDestinationChange({
                            ...destination,
                            transportDetails: { ...destination.transportDetails, costs: val },
                          });
                        }}
                        currencyCode={selectedCurrency}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ px: 0.5, width: 0 }}>
                      <Tooltip title={destination.transportDetails?.paid === true ? "Paid" : "Planned"}>
                        <Checkbox
                          size="small"
                          checked={destination.transportDetails?.paid === true}
                          onChange={(e) => {
                            if (!destination.transportDetails) return;
                            onDestinationChange({
                              ...destination,
                              transportDetails: { ...destination.transportDetails, paid: e.target.checked },
                            });
                          }}
                          slotProps={{
                            input: {
                              "aria-label": `onwards ${destination.transportDetails?.paid === true ? "Paid" : "Planned"}`,
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
          {formatCurrencyAmount(totalCost, selectedCurrency)}
        </Typography>
      </Box>
      
    </Card>
  );
};

interface BudgetOutletContext {
  homeCurrency: string;
}

export function BudgetPage({ trip }: { trip?: Trip }) {
  const { homeCurrency } = useOutletContext<BudgetOutletContext>();
  const { currentTrip, tripsLoading, updateTrip } = useTripContext();
  const usedTrip = trip ?? currentTrip;
  const [destinationTotals, setDestinationTotals] = useState<Record<string, number>>({});
  const [plannedTotals, setPlannedTotals] = useState<Record<string, number>>({});
  const handleDestinationUpdate = (updated: Destination) => {
    if (!usedTrip) return;
    updateTrip({
      ...usedTrip,
      destinations: (usedTrip.destinations ?? []).map((d) => (d.id === updated.id ? updated : d)),
    });
  };

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
              homeCurrency={homeCurrency}
              outboundMode={destinations[index + 1]?.transportDetails?.mode}
              showOnwards={index < destinations.length - 1}
              onTotalChange={handleDestinationTotalChange}
              onPlannedTotalChange={handlePlannedTotalChange}
              onDestinationChange={handleDestinationUpdate}
            />
          ))}
          <Card sx={{ p: 1, my: 2, maxWidth: 600, mx: "auto" }}>
            <Table size="small">
              <TableBody>
                {destinations.map(dest => {
                  const currencyCode = dest.destinationCurrency
                    ? toSnapshot(dest.destinationCurrency).currency.code
                    : getDestinationCurrency(dest.placeDetails?.countryCode) ?? homeCurrency;
                  return (
                    <TableRow key={dest.id}>
                      <TableCell>
                        {dest.displayName || dest.name}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrencyAmount(destinationTotals[dest.id] ?? 0, currencyCode)}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                {formatCurrencyAmount(outstandingTotal, homeCurrency)}
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
                {formatCurrencyAmount(grandTotal, homeCurrency)}
              </Typography>
            </Box>
            
          </Card>
        </>
      )}
    </>
  );
}
