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
        console.log("\n\nthis is a debounced function for event", eventType);
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

function checkUserActivityBetweenCheckpoints({
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

  console.log("\n\n tracking user activity between checkpoints");

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
        console.log(
          "\n\ntimer callback with timerId",
          timerId,
          "with checkpoint",
          currentCheckPoint
        );
        // check if user is active and add to store
        if (isUserActive) {
          console.log(
            "user was active in this checkpoint so adding point to store"
          );
          store.addToStore(currentProviderId, "time_on_page", 1);
          isUserActive = false;
        } else {
          console.log("user was not active in this checkpoint");
        }

        // check if it's not the last check point i.e. last check cycle
        if (!isLastCheckPoint(index, checkPoints.length)) {
          setupEventListeners();
          // call next timer function
          timerId = timerCallback[index + 1]();
        } else {
          console.log("\nthis is the last check point");

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
  console.log("\nadding event listeners to track user activity");
  trackedEvents.forEach((event) => {
    document.addEventListener(event, handleUserEvent);
  });
}

function isLastCheckPoint(index, length) {
  return index === length - 1;
}

function stopTimer() {
  console.log("stopping any active timer");
  clearTimeout(timerId);
}

function handleUserEvent(event) {
  console.log("\n\n\nuser is now active because of event", event.type);
  isUserActive = true;

  removeUserActiveEventListeners();
}

function removeUserActiveEventListeners() {
  console.log("now removing listeners", "\n\n\n");
  trackedEvents.forEach((event) => {
    document.removeEventListener(event, handleUserEvent);
  });
}

function stopCheckingUserActivity() {
  console.log("\n\nstopping checking user activity");

  if (timerId) stopTimer();
  isUserActive = false;

  removeUserActiveEventListeners();
  console.log("\n\n\n\n");
}

const resetEventWeightsMap = () => {
  for (const key in eventWeightsMap) {
    delete eventWeightsMap[key];
  }
};

const getEventWeightsMap = () => {
  return { ...eventWeightsMap };
};

export {
  resetEventWeightsMap,
  getEventWeightsMap,
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  checkUserActivityBetweenCheckpoints,
  stopCheckingUserActivity,
};
