import debounce from "./debounce";
import throttle from "./throttle";
import * as store from "./store";
import * as weightedAverage from "./weightedAverage";
import {
  setupHistoryListener,
  isUserActive,
  updateEndTime,
  incrementTimeOnPage,
} from "./utils";

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
let functionCallFlag = null;

function trackTimeOnPages({ weight, id = null }) {
  startTime = Date.now();
  functionCallFlag = true;
  endTime = startTime + INTERVAL_TIME;
  // register the time on page event and weight
  registerEventsAndWeights([["time_on_page", weight]]);

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
      // const currentPath = window.location.pathname;
      if (isUserActive(startTime, endTime)) {
        startTime = Date.now();
        console.log(
          "inside of start time:",
          startTime,
          endTime,
          endTime - startTime
        );
        // checkPathNameAndStoreTime(currentPath, patterns);
        incrementTimeOnPage(id);
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

  // instead of starting the interval with the function, use the custom event to start the interval
  // startInterval();

  // restart interval when document is visible
  function handleVisibilityChange() {
    console.log("visibility changed", document.hidden);
    if (document.hidden) {
      endTime = Date.now();
    } else {
      restartInterval();
      startTime = Date.now();
      endTime = updateEndTime(startTime, INTERVAL_TIME);
    }
    console.log(startTime, endTime, endTime - startTime);
  }
  // document.addEventListener("visibilitychange", handleVisibilityChange);

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
    endTime = updateEndTime(startTime, INTERVAL_TIME);
    console.log(startTime, endTime, endTime - startTime);
  }

  // add time to endTime when user is active on the page
  // i.e. when user is scrolling, moving mouse, typing, etc.
  const throttleAddTime = throttle(addTime, CHECK_TIME);
  // events.forEach((event) => {
  //   document.addEventListener(event, throttleAddTime);
  // });

  // dispatch custom event when location changes
  setupHistoryListener();

  // add time to endTime when location changes
  window.addEventListener("locationchange", handleLocationChange);
  function handleLocationChange() {
    const idTest = functionCallFlag ? null : id;

    console.log(
      "location chagned with flag",
      functionCallFlag,
      "with id",
      idTest
    );

    if (intervalId) stopInterval();

    events.forEach((event) => {
      console.log("removing event listeners");
      document.removeEventListener(event, throttleAddTime);
    });
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    // if the function is called i.e. the page should be tracked
    if (functionCallFlag) {
      events.forEach((event) => {
        console.log("adding event listeners");
        document.addEventListener(event, throttleAddTime);
      });

      document.addEventListener("visibilitychange", handleVisibilityChange);

      startTime = Date.now();
      endTime = updateEndTime(startTime, INTERVAL_TIME);
      startInterval();
      functionCallFlag = false;
      // return;
    }
  }

  // dispatch custom event when the page to be tracked is loaded
  if (id && functionCallFlag) window.dispatchEvent(new Event("locationchange"));
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  trackTimeOnPages,
};
