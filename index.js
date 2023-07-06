import debounce from "lodash/debounce";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";

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

//All variables for time on page
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
  checkPoints = [7000, 10000, 15000],
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
				handleTimerCallback();
      }, currentCheckPoint - prevCheckPoint);
    };
  });

  // start the cycle
  // timerCallback[0];
  return timerCallback[0]();
}

function setupEventListeners(){
	console.log("adding event listeners");
  events.forEach((event) => {
    document.addEventListener(event, handleUserEvent);
  });
}

function handleTimerCallback () {
	console.log("timer callback", timerId, index, currentCheckPoint);
	// check if user is active and add to store
	if (isUserActive) {
		console.log("user is active");
		store.addToStore(currentProviderId, "time_on_page", 1);
		isUserActive = false;
	}

	// check if it's not the last check point i.e. last check cycle
	if (index !== checkPoints.length - 1) {
		console.log("not the last check ponit");
		setupEventListeners();
		// call next timer function
		timerId = timers[index + 1]();
	} else {
		console.log("last check ponit");

		// remove event listeners if it's the last check cycle
		removeUserActiveEventListeners();
		timerId = null;
		isUserActive = false;
	}
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
