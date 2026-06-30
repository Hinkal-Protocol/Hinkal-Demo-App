import { getCurrentTimeInSeconds } from "./getCurrentTimeInSeconds";
import { SCHEDULE_DELAY_OPTIONS } from "../constants/schedule.constants";
import { ScheduleDelayOption } from "../types";

export const getTxScheduleTime = (
  selectedScheduleDelay: ScheduleDelayOption,
): number | undefined => {
  if (selectedScheduleDelay === ScheduleDelayOption.INSTANTLY) return undefined;

  const currentTime = getCurrentTimeInSeconds();
  return currentTime + (SCHEDULE_DELAY_OPTIONS[selectedScheduleDelay] ?? 0);
};
