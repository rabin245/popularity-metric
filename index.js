import debounce from "./debounce";
import throttle from "./throttle";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";
import { isUserActive, updateEndTime } from "./utils";

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

let startTime = null;
let endTime = null;
let intervalId = null;
let pageStartTime = null;
let idleStartTime = null;
let totalActiveDuration = 0;
let totalIdleDuration = 0;

const throttleAddTime = throttle(addTime, CHECK_TIME);
let currentProviderId = null;

function trackTimeOnPage({ weight, id = null }) {
  pageStartTime = Date.now();
  currentProviderId = id;
  startTime = Date.now();
  endTime = startTime + INTERVAL_TIME;
  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);

  // add event listeners
  events.forEach((event) => {
    console.log("adding event listeners");
    document.addEventListener(event, throttleAddTime);
  });

  document.addEventListener("visibilitychange", handleVisibilityChange);
  // start tracking
  startInterval(currentProviderId);
}

function startInterval(id) {
  console.log("starting interval", intervalId);
  intervalId = setInterval(() => {
    startTime = Date.now();
    console.log(
      "running setinterval with startTime:",
      startTime,
      endTime,
      endTime - startTime
    );

    if (!isUserActive(startTime, endTime)) {
      if (!idleStartTime) idleStartTime = endTime;
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
  startInterval(currentProviderId);
}

// restart interval when document is visible
function handleVisibilityChange() {
  console.log("visibility changed", document.hidden);
  if (document.hidden) {
    endTime = Date.now();
    idleStartTime = endTime;
  } else {
    if (idleStartTime) {
      totalIdleDuration += Date.now() - idleStartTime;
      idleStartTime = null;
    }
    restartInterval();
    startTime = Date.now();
    endTime = updateEndTime(startTime, INTERVAL_TIME);
  }
  console.log(startTime, endTime, endTime - startTime);
}

function addTime() {
  console.log(
    "adding time to active time",
    startTime,
    endTime,
    endTime - startTime
  );

  if (idleStartTime) {
    totalIdleDuration += Date.now() - idleStartTime;
    idleStartTime = null;
  }
  restartInterval();

  endTime = updateEndTime(startTime, INTERVAL_TIME);
  console.log(startTime, endTime, endTime - startTime);
}

function stopTrackingTimeOnPage() {
  if (intervalId) stopInterval();

  if (idleStartTime) {
    totalIdleDuration += Date.now() - idleStartTime;
    idleStartTime = null;
  }

  const totalTime = Date.now() - pageStartTime;
  totalActiveDuration = Math.round(totalTime - totalIdleDuration) / 1000;
  console.log(
    pageStartTime,
    idleStartTime,
    totalIdleDuration,
    totalTime / 1000,
    totalActiveDuration
  );

  store.addToStore(currentProviderId, "time_on_page", totalActiveDuration);

  events.forEach((event) => {
    console.log("removing event listeners");
    document.removeEventListener(event, throttleAddTime);
  });
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  totalIdleDuration = 0;
  totalActiveDuration = 0;
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  trackTimeOnPage,
  stopTrackingTimeOnPage,
};
