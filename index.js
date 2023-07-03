import debounce from "./debounce";
import throttle from "./throttle";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";
import { checkPathNameAndStoreTime } from "./pathUtils";

// constants for tracking time on page
const INTERVAL_TIME = 10000;
const CHECK_TIME = 5000;

// events to track if the user is idle in page
const events = ["mouseup", "keydown", "scroll", "mousemove"];

let eventWeights = {};

const debounceByEventType = {};

function registerEventsAndWeights(eventsAndWeights) {
  eventsAndWeights.forEach(([eventType, weight]) => {
    eventWeights[eventType] = weight;
  });
}

const trackEvent = (eventType, provider, count, delay = 5000) => {
  if (!debounceByEventType[eventType]) {
    debounceByEventType[eventType] = debounce((eventType, provider, count) => {
      store.addToStore(provider, eventType, count);
    }, delay);
  }

  debounceByEventType[eventType](eventType, provider, count);
};

function getStoreByPopularity() {
  const providerEventsData = store.getValueFromStore(eventWeights);
  const weightedArr = weightedAverage.calculateWeightedAverage(
    providerEventsData,
    eventWeights
  );
  const sortedWeightedArr = weightedAverage.sortWeights(weightedArr);
  return sortedWeightedArr;
}

function trackTimeOnPages({ weight, patterns }) {
  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);
  if (!patterns) throw new Error("Patterns not provided");

  let startTime = Date.now();
  let endTime = startTime + INTERVAL_TIME;

  let intervalId = null; // Variable to store the interval ID

  // start the interval to check if the user if active
  function startInterval() {
    console.log("starting interval", intervalId);
    intervalId = setInterval(() => {
      startTime = Date.now();
      console.log(
        "running setinterval with startTime:",
        startTime,
        endTime,
        endTime - startTime
      );
      const currentPath = window.location.pathname;
      if (isUserActive(startTime, endTime)) {
        startTime = Date.now();
        console.log(
          "inside of start time:",
          startTime,
          endTime,
          endTime - startTime
        );
        checkPathNameAndStoreTime(currentPath, patterns);
      }
    }, CHECK_TIME - 50);
    console.log("started itnerval", intervalId);
  }

  function stopInterval() {
    console.log(
      "stopping interval",
      intervalId,
      startTime,
      endTime,
      endTime - startTime
    );
    clearInterval(intervalId);
    startTime = Date.now();
    intervalId = null;
  }

  // restart the interval
  function restartInterval() {
    if (intervalId) stopInterval();
    startInterval();
  }

  startInterval();

  // restart interval when document is visible
  document.addEventListener("visibilitychange", () => {
    console.log("visibility changed", document.hidden);
    if (document.hidden) {
      endTime = Date.now();
    } else {
      restartInterval();
      startTime = Date.now();
      endTime = updateEndTime(startTime);
    }
    console.log(startTime, endTime, endTime - startTime);
  });

  function addTime() {
    console.log(
      "adding time to active time",
      startTime,
      endTime,
      endTime - startTime
    );
    if (!isUserActive(startTime, endTime)) {
      console.log("user is not active");
      restartInterval();
    }
    endTime = updateEndTime(startTime);
    console.log(startTime, endTime, endTime - startTime);
  }

  // add time to endTime when user is active on the page
  // i.e. when user is scrolling, moving mouse, typing, etc.
  const throttleAddTime = throttle(addTime, CHECK_TIME);
  events.forEach((event) => {
    document.addEventListener(event, throttleAddTime);
  });

  // dispatch custom event when location changes
  setupHistoryListener();

  // add time to endTime when location changes
  window.addEventListener("locationchange", () => {
    console.log("location chagned");
    restartInterval();
    endTime = updateEndTime(startTime);
  });
}

function isUserActive(startTime, endTime) {
  return !document.hidden && startTime <= endTime;
}

function updateEndTime(startTime) {
  return startTime + INTERVAL_TIME;
}

function setupHistoryListener() {
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

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  trackTimeOnPages,
};
