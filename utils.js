export function isUserActive(startTime, endTime) {
  return !document.hidden && startTime <= endTime;
}

export function updateEndTime(startTime, additionalTime) {
  return startTime + additionalTime;
}
