import debounce from "lodash/debounce";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";

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
let currentProviderId = null;
let initialActiveCheckTime = 10 * 1000; // 10 sec
let finalActiveCheckTime = 20 * 1000; // 20 sec
// let finalActiveCheckTime = 5 * 60 * 1000; // 5 min
// let point = 0;
let timerId = null;
let isUserActive = false;

function trackTimeOnPage({
  weight,
  id = null,
  initialCheckTime = null,
  finalCheckTime = null,
}) {
  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);

  if (!id) {
    throw new Error("id is required!");
  }
  currentProviderId = id;

  if (initialCheckTime) {
    initialActiveCheckTime = initialCheckTime;
  }
  if (finalCheckTime) {
    finalActiveCheckTime = finalCheckTime;
  }

  startInitialTimer();
}

function startInitialTimer() {
  timerId = setTimeout(() => {
    // point = 1;
    console.log("initial timer callback");
    console.log("adding event listeners");
    events.forEach((event) => {
      document.addEventListener(event, handleUserEvent);
    });

    // add to store
    store.addToStore(currentProviderId, "time_on_page", 1);
    // start second timer
    startSecondTimer();
  }, initialActiveCheckTime);
}

function startSecondTimer() {
  timerId = setTimeout(() => {
    console.log("second timer callback");
    if (isUserActive) {
      //  point = 2;
      store.addToStore(currentProviderId, "time_on_page", 1);
    }

    timerId = null;
    isUserActive = false;
    removeUserActiveEventListeners();
  }, finalActiveCheckTime - initialActiveCheckTime);
}

function stopTimer() {
  console.log("stopping any timer");
  clearTimeout(timerId);
}

function handleUserEvent() {
  console.log("user is active because of event");
  isUserActive = true;

  removeUserActiveEventListeners();
}

function removeUserActiveEventListeners() {
  console.log("now removing listeners");
  events.forEach((event) => {
    document.removeEventListener(event, handleUserEvent);
  });
}

function stopTrackingTime() {
  if (timerId) stopTimer();
  isUserActive = false;

  removeUserActiveEventListeners();
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  trackTimeOnPage,
  stopTrackingTime,
};
