import { addToStore } from "./store";

export function incrementTimeOnPage(id) {
  addToStore(id, "time_on_page", 5);
}

export function isUserActive(startTime, endTime) {
  return !document.hidden && startTime <= endTime;
}

export function updateEndTime(startTime, additionalTime) {
  return startTime + additionalTime;
}
