import { useState, useRef, useEffect, type ReactElement } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog } from './utility/ConfirmDialog';
import { type Trip } from '../types/trip';

interface TripSidebarItemProps {
  trip: Trip;
  isSelected: boolean;
  autoEdit: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onEditComplete: () => void;
}

export const TripSidebarItem = ({ trip, isSelected, autoEdit, onSelect, onRename, onDelete, onEditComplete }: TripSidebarItemProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(trip.name);
  const [showIcons, setShowIcons] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoEdit && !isEditing) {
      setIsEditing(true);
      setEditValue(trip.name);
    }
  }, [autoEdit, isEditing, trip.name]);

  useEffect(() => {
    if (isEditing && textFieldRef.current) {
      textFieldRef.current.focus();
      textFieldRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(trip.name);
  };

  const handleSave = (): void => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== trip.name) {
      onRename(trimmed);
    } else {
      setEditValue(trip.name);
    }
    setIsEditing(false);
    onEditComplete();
  };

  const handleCancel = (): void => {
    setEditValue(trip.name);
    setIsEditing(false);
    onEditComplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (): void => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false);
  };

  if (isEditing) {
    return (
      <ListItemButton
        selected={isSelected}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <TextField
          inputRef={textFieldRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          size="small"
          fullWidth
          variant="standard"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
            },
          }}
        />
      </ListItemButton>
    );
  }

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={onSelect}
        onMouseEnter={() => setShowIcons(true)}
        onMouseLeave={() => setShowIcons(false)}
        sx={{
          '&:hover': {
            '& .action-icon': {
              opacity: 1,
            },
          },
        }}
      >
        <ListItemText primary={trip.name} />
        <IconButton
          className="action-icon"
          size="small"
          onClick={handleEditClick}
          sx={{
            opacity: showIcons ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          className="action-icon"
          size="small"
          onClick={handleDeleteClick}
          sx={{
            opacity: showIcons ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItemButton>
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        title="Delete Trip"
        message={`Are you sure you want to delete "${trip.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        confirmButtonColor="error"
      />
    </>
  );
};
