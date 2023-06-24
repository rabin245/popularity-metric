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

let eventWeights = {};

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

function trackEvent(eventType, provider, count) {
  addToStore(provider, eventType, count);
}

function getStoreByPopularity() {
  const providerEventsData = getValueFromStore();
  const weightedArr = calculateWeightedAverage(providerEventsData);
  const sortedArr = mergeSort(weightedArr);
  return sortedArr;
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

function registerEventsAndWeights(eventType, weight) {
  eventWeights[eventType] = weight;
}

export {
  trackEvent,
  registerEventsAndWeights,
  getStoreByPopularity,
  eventWeights,
};
