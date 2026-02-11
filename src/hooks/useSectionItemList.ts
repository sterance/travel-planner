import { useState, useMemo } from "react";
import type { Dayjs } from "dayjs";
import { getSafeDayjsValue } from "../utils/dateUtils";

interface SectionItemFields {
  name: string;
  address: string;
  startDateTime: Dayjs | null;
  endDateTime: Dayjs | null;
}

interface UseSectionItemListConfig<TItem> {
  items: TItem[];
  onItemsChange: (items: TItem[]) => void;
  destinationEndDate: Dayjs | null;
  getStartDateTime: (item: TItem) => Dayjs | null;
  getEndDateTime: (item: TItem) => Dayjs | null;
  createOrUpdateItem: (existing: TItem | undefined, fields: SectionItemFields) => TItem;
}

interface UseSectionItemListResult {
  isModalOpen: boolean;
  editingIndex: number | null;
  name: string;
  address: string;
  startDateTime: Dayjs | null;
  endDateTime: Dayjs | null;
  latestEndDate: Dayjs | null;
  hasCoverageToDestinationEnd: boolean;
  hasCoveragePastDestinationEnd: boolean;
  showAddButton: boolean;
  openForNew: () => void;
  openForEdit: (index: number) => void;
  closeModal: () => void;
  saveCurrent: () => void;
  clearCurrent: () => void;
  setName: (value: string) => void;
  setAddress: (value: string) => void;
  setStartDateTime: (value: Dayjs | null) => void;
  setEndDateTime: (value: Dayjs | null) => void;
}

export function useSectionItemList<TItem>({
  items,
  onItemsChange,
  destinationEndDate,
  getStartDateTime,
  getEndDateTime,
  createOrUpdateItem,
}: UseSectionItemListConfig<TItem>): UseSectionItemListResult {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null);
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null);

  const latestEndDate = useMemo<Dayjs | null>(() => {
    return items.reduce<Dayjs | null>((latest, item) => {
      const end = getEndDateTime(item);
      if (!end || !end.isValid()) {
        return latest;
      }
      if (!latest || end.isAfter(latest)) {
        return end;
      }
      return latest;
    }, null);
  }, [items, getEndDateTime]);

  const hasCoverageToDestinationEnd =
    destinationEndDate !== null &&
    latestEndDate !== null &&
    latestEndDate.isSame(destinationEndDate, "day");

  const hasCoveragePastDestinationEnd =
    destinationEndDate !== null &&
    latestEndDate !== null &&
    latestEndDate.isAfter(destinationEndDate, "day");

  const showAddButton = !hasCoverageToDestinationEnd;

  const openForNew = (): void => {
    setEditingIndex(null);
    setName("");
    setAddress("");
    setStartDateTime(null);
    setEndDateTime(null);
    setIsModalOpen(true);
  };

  const openForEdit = (index: number): void => {
    const item = items[index];
    if (item === undefined) {
      openForNew();
      return;
    }

    setEditingIndex(index);
    setName((item as unknown as { name?: string }).name ?? "");
    setAddress((item as unknown as { address?: string }).address ?? "");
    const start = getSafeDayjsValue(getStartDateTime(item));
    const end = getSafeDayjsValue(getEndDateTime(item));
    setStartDateTime(start);
    setEndDateTime(end);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const saveCurrent = (): void => {
    const nextItems = [...items];
    const existing = editingIndex !== null ? nextItems[editingIndex] : undefined;

    const updated = createOrUpdateItem(existing, {
      name,
      address,
      startDateTime,
      endDateTime,
    });

    if (editingIndex !== null && nextItems[editingIndex] !== undefined) {
      nextItems[editingIndex] = updated;
    } else {
      nextItems.push(updated);
    }

    onItemsChange(nextItems);
    setIsModalOpen(false);
  };

  const clearCurrent = (): void => {
    if (editingIndex === null) {
      setIsModalOpen(false);
      return;
    }

    const nextItems = items.filter((_, index) => index !== editingIndex);
    onItemsChange(nextItems);
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    editingIndex,
    name,
    address,
    startDateTime,
    endDateTime,
    latestEndDate,
    hasCoverageToDestinationEnd,
    hasCoveragePastDestinationEnd,
    showAddButton,
    openForNew,
    openForEdit,
    closeModal,
    saveCurrent,
    clearCurrent,
    setName,
    setAddress,
    setStartDateTime,
    setEndDateTime,
  };
}

