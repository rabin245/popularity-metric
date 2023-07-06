import debounce from "lodash/debounce";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";

//Constants for tracking time on page
const debounceDelay = 5 * 1000; // 5 seconds
// events to track if the user is idle in page
const trackedEvents = ["mouseup", "keydown", "scroll", "mousemove"];

let eventWeightsMap = {};

// debounce functions for tracking each event type
const debounceByEventHandlers = {};

// variables for tracking time on page
let currentProviderId = null;
let timerId = null;
let isUserActive = false;

function registerEventsAndWeights(eventsAndWeights) {
  eventsAndWeights.forEach(([eventType, weight]) => {
    eventWeightsMap[eventType] = weight;
  });
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

function trackTimeOnPage({
  weight,
  id = null,
  checkPoints = [7000, 10000, 15000],
}) {
  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);

  if (!id) {
    throw new Error("id is required!");
  }
  currentProviderId = id;

  timerId = executeCheckpointTimers(checkPoints);
}

function executeCheckpointTimers(checkPoints) {
  // if needed to check for user activity before first check point
  setupEventListeners();

  // [10,20,30]
  const timerCallback = checkPoints.map((currentCheckPoint, index) => {
    const prevCheckPoint = checkPoints[index - 1] || 0;

    return function () {
      return setTimeout(() => {
        console.log("timer callback", timerId, index, currentCheckPoint);
        // check if user is active and add to store
        if (isUserActive) {
          console.log("user is active");
          store.addToStore(currentProviderId, "time_on_page", 1);
          isUserActive = false;
        }

        // check if it's not the last check point i.e. last check cycle
        if (!isLastCheckPoint(index, checkPoints.length)) {
          console.log("not the last check ponit");
          setupEventListeners();
          // call next timer function
          timerId = timerCallback[index + 1]();
        } else {
          console.log("last check ponit");

          // remove event listeners if it's the last check cycle
          removeUserActiveEventListeners();
          timerId = null;
          isUserActive = false;
        }
      }, currentCheckPoint - prevCheckPoint);
    };
  });

  // start the cycle
  return timerCallback[0]();
}

function setupEventListeners() {
  console.log("adding event listeners");
  trackedEvents.forEach((event) => {
    document.addEventListener(event, handleUserEvent);
  });
}

function isLastCheckPoint(index, length) {
  return index === length - 1;
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
  trackedEvents.forEach((event) => {
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
