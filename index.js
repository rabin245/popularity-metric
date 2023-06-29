// Weight of each metric/key (sum of all weights should be 1)
const example_eventWeights = {
  num_of_review: 0.2,
  average_rating: 0.25,
  profile_views: 0.05,
  favorites: 0.1,
  share_link: 0.05,
  share_email: 0.05,
  share_facebook: 0.05,
  share_twitter: 0.05,
  share_instagram: 0.05,
  share_whatsapp: 0.05,
  share_viber: 0.05,
  call: 0.05,
};

// constants for tracking time on page
const INTERVAL_TIME = 10000;
const ONE_SECOND = 1000;
// events to track if the user is idle in page
const events = ["mouseup", "keydown", "scroll", "mousemove"];

let eventWeights = {};

let lastEventTimestamps = {};
const COOLDOWN_PERIOD = 5000;

const addToStore = (key, eventType, count) => {
  // Get the stored data from localStorage
  let storedData = JSON.parse(localStorage.getItem("providersStore"));

  if (!storedData) {
    storedData = {};
  }

  if (!storedData[key]) {
    storedData[key] = {};
  }

  if (!storedData[key][eventType]) {
    storedData[key][eventType] = 0;
  }

  storedData[key][eventType] += count;

  // Save the updated data to localStorage
  localStorage.setItem("providersStore", JSON.stringify(storedData));
};

function getValueFromStore() {
  // Get the stored data from localStorage
  const storedData = JSON.parse(localStorage.getItem("providersStore"));

  const eventTypes = Object.keys(eventWeights);

  // Initialize missing event counts to 0
  if (storedData) {
    Object.values(storedData).forEach((eventCountObj) => {
      eventTypes.forEach((event) => {
        if (eventCountObj[event] === undefined) {
          eventCountObj[event] = 0;
        }
      });
    });
  }

  return storedData;
}

function isEventOnCooldown(provider, eventType) {
  if (lastEventTimestamps[provider] === undefined) {
    lastEventTimestamps[provider] = {};
  }
  if (!lastEventTimestamps[provider][eventType]) {
    lastEventTimestamps[provider][eventType] = 0;
  }

  const currentTime = Date.now();
  const timeSinceLastEvent =
    currentTime - lastEventTimestamps[provider][eventType];

  return timeSinceLastEvent < COOLDOWN_PERIOD;
}

function trackEvent(eventType, provider, count) {
  if (isEventOnCooldown(provider, eventType)) {
    console.log("Event ", eventType, "is on cooldown for provider", provider);
    return;
  }
  console.log("event is not on cooldown adding to store");
  addToStore(provider, eventType, count);
  lastEventTimestamps[provider][eventType] = Date.now();
}

function calculateWeightedAverage(eventCounts) {
  //Convert object to array
  const arr = Object.entries(eventCounts);

  // get total sum of weights of registered events
  const totalWeight = Object.values(eventWeights).reduce(
    (acc, value) => acc + value,
    0
  );

  //Loop through array and calculate weightedAverage for each key
  const weightedAverages = arr.map((value) => {
    const [providerKey, weightObj] = value;

    const weightedSum = Object.entries(weightObj).reduce(
      (acc, [event, count]) => {
        return acc + count * eventWeights[event];
      },
      0
    );

    const averageSum = weightedSum / totalWeight;

    return [providerKey, averageSum];
  });

  return weightedAverages;
}

function mergeSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const merged = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i][1] > right[j][1]) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }

  return merged.concat(left.slice(i)).concat(right.slice(j));
}

function registerEventsAndWeights(eventsAndWeights) {
  eventsAndWeights.forEach(([eventType, weight]) => {
    eventWeights[eventType] = weight;
  });
}

function getStoreByPopularity() {
  const providerEventsData = getValueFromStore();
  const weightedArr = calculateWeightedAverage(providerEventsData);
  const sortedArr = mergeSort(weightedArr);
  return sortedArr;
}

function throttleFunc(func, interval) {
  console.log("running throttle func");
  let shouldFire = true;
  return function () {
    if (shouldFire) {
      console.log("successful firing");
      func();

      shouldFire = false;
      setTimeout(() => {
        shouldFire = true;
      }, interval);
    }
  };
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
  }, ONE_SECOND);

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
    const throttleAddTime = throttleFunc(addTime, 5000);
    document.addEventListener(event, throttleAddTime);
  });
}

function checkPathNameAndStoreTime(path, patterns) {
  patterns.forEach((pattern) => {
    const regex = new RegExp(pattern);
    if (regex.test(path)) {
      incrementTimeOnPath(path);
    }
  });
}

function incrementTimeOnPath(path) {
  // assume path is like /provider/:id
  const id = path.split("/")[2];
  // trackEvent("time_on_page", id, 1);
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  trackTimeOnPages,
};
