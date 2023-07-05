import debounce from "./debounce";
import throttle from "./throttle";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";

// constants for tracking time on page
const ACTIVE_TIME = 5000;
const THROTTLE_TIME = 2500;
const DEBOUNCE_TIME = 5000;

// events to track if the user is idle in page
const events = ["mouseup", "keydown", "scroll", "mousemove"];

let eventWeights = {};

const debounceByEventType = {};

function registerEventsAndWeights(eventsAndWeights) {
  eventsAndWeights.forEach(([eventType, weight]) => {
    eventWeights[eventType] = weight;
  });
}

const trackEvent = (eventType, provider, count, delay = DEBOUNCE_TIME) => {
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

let timeoutId = null;
let pageStartTime = null;
let idleStartTime = null;
let totalActiveDuration = 0;
let totalIdleDuration = 0;

const throttleAddTime = throttle(addTime, THROTTLE_TIME);
let currentProviderId = null;

function trackTimeOnPage({ weight, id = null }) {
  totalIdleDuration = 0;
  totalActiveDuration = 0;
  pageStartTime = Date.now();
  currentProviderId = id;

  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);

  // add event listeners
  events.forEach((event) => {
    console.log("adding event listeners");
    document.addEventListener(event, throttleAddTime);
  });

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // start tracking
  startTimer();
}

function startTimer() {
  timeoutId = setTimeout(() => {
    console.log("this means user is idle");

    if (!idleStartTime) {
      idleStartTime = Date.now();
    }
  }, ACTIVE_TIME + 100);
}

function stopTimer() {
  console.log("stoping timer");
  clearTimeout(timeoutId);
  timeoutId = null;
}

// restart the interval
function restartTimer() {
  if (timeoutId) stopTimer();
  startTimer();
}

// restart interval when document is visible
function handleVisibilityChange() {
  console.log("visibility changed", document.hidden);
  if (document.hidden) {
    idleStartTime = Date.now();
  } else {
    if (idleStartTime) {
      totalIdleDuration += Date.now() - idleStartTime;
      idleStartTime = null;
    }
    restartTimer();
  }
}

function addTime() {
  console.log("user active event");
  if (idleStartTime) {
    totalIdleDuration += Date.now() - idleStartTime;
    idleStartTime = null;
  }
  restartTimer();
}

function stopTrackingTimeOnPage() {
  if (timeoutId) stopTimer();

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
