import debounce from "lodash/debounce";
import throttle from "lodash/throttle";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";

// constants for tracking time on page
let activeTimeThreshold = 5 * 1000; // 5 seconds
let throttleDelay = 2.5 * 1000; // 2.5 seconds
let debounceDelay = 5 * 1000; // 5 seconds

// events to track if the user is idle in page
let trackedEvents = ["mouseup", "keydown", "scroll", "mousemove"];

let eventWeightsMap = {};

// debounce functions for tracking each event type
const debounceByEventHandlers = {};

// variables for tracking time on page
let timeoutId = null;
let pageStartTime = null;
let idleStartTime = null;
let totalActiveDuration = 0;
let totalIdleDuration = 0;
let currentProviderId = null;

function registerTimeThresholds({
  customActiveTimeThreshold,
  customThrottleDelay,
  customDebounceDelay,
}) {
  activeTimeThreshold = customActiveTimeThreshold;
  throttleDelay = customThrottleDelay;
  debounceDelay = customDebounceDelay;
}

function registerTrackedEvents(events) {
  trackedEvents = events;
}

function registerEventsAndWeights(eventsAndWeights) {
  eventWeightsMap = Object.fromEntries(eventsAndWeights);
}

const trackEvent = (eventType, provider, count, delay = debounceDelay) => {
  if (!debounceByEventHandlers[eventType]) {
    debounceByEventHandlers[eventType] = debounce(
      (eventType, provider, count) => {
        store.addToStore(provider, eventType, count);
      },
      delay
    );
  }

  debounceByEventHandlers[eventType](eventType, provider, count);
};

function getStoreByPopularity() {
  const providerEventsData = store.getValueFromStore(eventWeightsMap);
  const weightedArr = weightedAverage.calculateWeightedAverage(
    providerEventsData,
    eventWeightsMap
  );
  const sortedWeightedArr = weightedAverage.sortWeights(weightedArr);
  return sortedWeightedArr;
}

const throttledHandleActiveEvent = throttle(handleActiveEvent, throttleDelay);

function startTrackingTimeOnPage({ weight, id = null }) {
  totalIdleDuration = 0;
  totalActiveDuration = 0;
  pageStartTime = Date.now();
  currentProviderId = id;

  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);

  // add event listeners
  trackedEvents.forEach((event) => {
    console.log("adding event listeners");
    document.addEventListener(event, throttledHandleActiveEvent);
  });

  document.addEventListener("visibilitychange", onVisibilityChange);

  // start tracking
  startIdleTimer();
}

function startIdleTimer() {
  timeoutId = setTimeout(() => {
    console.log("this means user is idle");

    if (!idleStartTime) {
      idleStartTime = Date.now();
    }
  }, activeTimeThreshold + 100);
}

function stopIdleTimer() {
  console.log("stoping timer");
  clearTimeout(timeoutId);
  timeoutId = null;
}

// restart the interval
function restartIdleTimer() {
  if (timeoutId) stopIdleTimer();
  startIdleTimer();
}

// restart interval when document is visible
function onVisibilityChange() {
  console.log("visibility changed", document.hidden);
  if (document.hidden) {
    idleStartTime = Date.now();
  } else {
    if (idleStartTime) {
      totalIdleDuration += Date.now() - idleStartTime;
      idleStartTime = null;
    }
    restartIdleTimer();
  }
}

function handleActiveEvent() {
  console.log("user active event");
  if (idleStartTime) {
    totalIdleDuration += Date.now() - idleStartTime;
    idleStartTime = null;
  }
  restartIdleTimer();
}

function endTrackingTimeOnPage() {
  if (timeoutId) stopIdleTimer();

  if (idleStartTime) {
    totalIdleDuration += Date.now() - idleStartTime;
    idleStartTime = null;
  }

  const totalTime = Date.now() - pageStartTime;
  totalActiveDuration = Math.floor((totalTime - totalIdleDuration) / 1000);

  console.log(
    pageStartTime,
    idleStartTime,
    totalIdleDuration,
    totalTime / 1000,
    totalActiveDuration
  );

  store.addToStore(currentProviderId, "time_on_page", totalActiveDuration);

  trackedEvents.forEach((event) => {
    console.log("removing event listeners");
    document.removeEventListener(event, throttledHandleActiveEvent);
  });
  document.removeEventListener("visibilitychange", onVisibilityChange);

  pageStartTime = null;
  currentProviderId = null;
  totalIdleDuration = 0;
  totalActiveDuration = 0;
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  startTrackingTimeOnPage,
  endTrackingTimeOnPage,
  registerTrackedEvents,
  registerTimeThresholds,
};
