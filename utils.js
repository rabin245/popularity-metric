import { addToStore } from "./store";

export function incrementTimeOnPath(path, splitPosition) {
  // assume path is like /provider/:id
  const id = path.split("/")[splitPosition];
  addToStore(id, "time_on_page", 5);
}

export function isUserActive(startTime, endTime) {
  return !document.hidden && startTime <= endTime;
}

export function updateEndTime(startTime, additionalTime) {
  return startTime + additionalTime;
}

export function setupHistoryListener() {
  let oldPushState = history.pushState;
  history.pushState = function pushState() {
    let ret = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  let oldReplaceState = history.replaceState;
  history.replaceState = function replaceState() {
    let ret = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
}
