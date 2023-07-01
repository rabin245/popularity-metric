import debounce from "./debounce";
import throttle from "./throttle";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";
import { checkPathNameAndStoreTime } from "./pathUtils";

// constants for tracking time on page
const INTERVAL_TIME = 10000;
// events to track if the user is idle in page
const events = ["mouseup", "keydown", "scroll", "mousemove"];

let eventWeights = {};

const debounceByEventType = {};

function registerEventsAndWeights(eventsAndWeights) {
  eventsAndWeights.forEach(([eventType, weight]) => {
    eventWeights[eventType] = weight;
  });
}

const trackEvent = (eventType, provider, count) => {
  if (!debounceByEventType[eventType]) {
    debounceByEventType[eventType] = debounce((eventType, provider, count) => {
      store.addToStore(provider, eventType, count);
    }, 5000);
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
  registerEventsAndWeights([["time_on_page", weight]]);
  if (!patterns) throw new Error("Patterns not provided");

  let startTime = Date.now();
  let endTime = startTime + INTERVAL_TIME;

  setInterval(() => {
    const currentPath = window.location.pathname;
    if (!document.hidden && startTime <= endTime) {
      startTime = Date.now();
      checkPathNameAndStoreTime(currentPath, patterns);
    }
  }, 5000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      endTime = Date.now();
    } else {
      startTime = Date.now();
      endTime = startTime + INTERVAL_TIME;
    }
  });

  function addTime() {
    endTime = startTime + INTERVAL_TIME;
  }

  events.forEach((event) => {
    const throttleAddTime = throttle(addTime, 4000);
    document.addEventListener(event, throttleAddTime);
  });
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  trackTimeOnPages,
};
