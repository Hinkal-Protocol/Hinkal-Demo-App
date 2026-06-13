export const SCHEDULE_OPTIONS = [
  "instantly",
  "15m",
  "30m",
  "1h",
  "24h",
] as const;

export type ScheduleOption = (typeof SCHEDULE_OPTIONS)[number];

export const convertScheduleToMs = (schedule: ScheduleOption): number => {
  const scheduleMap: Record<ScheduleOption, number> = {
    instantly: 0,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
  };
  return scheduleMap[schedule];
};

export const getTxScheduleTime = (
  schedule: ScheduleOption,
): number | undefined => {
  const delayMs = convertScheduleToMs(schedule);
  if (delayMs === 0) return undefined;
  return Math.floor(Date.now() / 1000) + delayMs / 1000;
};
