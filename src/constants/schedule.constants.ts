import { ScheduleDelayOption } from "../types";

export const SCHEDULE_OPTIONS = [
  "instantly",
  "15m",
  "30m",
  "1h",
  "24h",
] as const;

export type ScheduleOption = (typeof SCHEDULE_OPTIONS)[number];

export const SCHEDULE_DELAY_OPTIONS: Partial<
  Record<ScheduleDelayOption, number | undefined>
> = {
  [ScheduleDelayOption.FIFTEEN_MINUTES]: 15 * 60, // 15 minutes
  [ScheduleDelayOption.THIRTY_MINUTES]: 30 * 60, // 30 minutes
  [ScheduleDelayOption.ONE_HOUR]: 60 * 60, // 1 hour
  [ScheduleDelayOption.TWENTY_FOUR_HOURS]: 24 * 60 * 60, // 24 hours
};
