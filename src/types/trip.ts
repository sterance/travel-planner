import { type Destination } from "./destination";
import { type Dayjs } from "dayjs";

export interface Trip {
  id: string;
  name: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  destinations: Destination[];
  createdAt: Dayjs | null;
  updatedAt: Dayjs | null;
}