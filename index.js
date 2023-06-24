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

// Event values for each provider
const global_store = {};

// todo: use localstorage to save the data for now
const addToStore = (key, eventType, count) => {
  if (global_store[key] === undefined) {
    global_store[key] = {};
  }
  if (global_store[key][eventType] === undefined) {
    global_store[key][eventType] = 0;
  }
  global_store[key][eventType] += count;
  console.log(global_store);
};

// todo: use localstorage to save the data for now
function getValueFromStore() {
  // return {
  //   provider_1: {
  //     num_of_review: 10,
  //     average_rating: 4.5,
  //     profile_views: 100,
  //     favorites: 5,
  //     share_link: 2,
  //     share_email: 10,
  //     share_facebook: 2,
  //     share_twitter: 9,
  //     share_instagram: 7,
  //     share_whatsapp: 1,
  //     share_viber: 3,
  //     call: 5,
  //   },
  //   provider_2: {
  //     num_of_review: 8,
  //     average_rating: 4,
  //     profile_views: 121,
  //     favorites: 8,
  //     share_link: 3,
  //     share_email: 0,
  //     share_facebook: 2,
  //     share_twitter: 9,
  //     share_instagram: 7,
  //     share_whatsapp: 0,
  //     share_viber: 0,
  //     call: 2,
  //   },
  //   provider_3: {
  //     num_of_review: 5,
  //     average_rating: 3.5,
  //     profile_views: 50,
  //     favorites: 2,
  //     share_link: 1,
  //     share_email: 0,
  //     share_facebook: 2,
  //     share_twitter: 9,
  //     share_instagram: 7,
  //     share_whatsapp: 0,
  //     share_viber: 0,
  //     call: 1,
  //   },
  //   provider_4: {
  //     num_of_review: 10,
  //     average_rating: 4.5,
  //     profile_views: 10,
  //     favorites: 100,
  //     share_link: 20,
  //     share_email: 10,
  //     share_facebook: 50,
  //     share_twitter: 5,
  //     share_instagram: 10,
  //     share_whatsapp: 100,
  //     share_viber: 80,
  //     call: 50,
  //   },
  // };

  const eventTypes = Object.keys(eventWeights);
  console.log(eventTypes);

  Object.entries(global_store).forEach(([id, eventCountObj]) => {
    eventTypes.forEach((event) => {
      if (eventCountObj[event] === undefined) {
        eventCountObj[event] = 0;
      }
    });
  });

  console.log(global_store);
  return global_store;
}

function trackEvent(eventType, provider, count) {
  addToStore(provider, eventType, count);
}

function getStoreByPopularity() {
  const global_store = getValueFromStore();
  const weightedArr = calculateWeightedAverage(global_store);
  console.log(weightedArr, "weightedArr");
  const sortedArr = mergeSort(weightedArr);
  console.log(sortedArr, "sortedArr");
  return sortedArr;
}

function calculateWeightedAverage(eventCounts) {
  console.log("starting here");
  //Convert object to array
  const arr = Object.entries(eventCounts);
  console.log(arr);

  // get total sum of weights of registered events
  const totalWeight = Object.values(eventWeights).reduce(
    (acc, value) => acc + value,
    0
  );

  console.log(totalWeight, "total weights");

  //Loop through array and calculate weightedAverage for each key
  const weightedAverages = arr.map((value) => {
    const [providerKey, weightObj] = value;
    console.log("value", value);
    console.log("eventWeights", eventWeights);

    const weightedSum = Object.entries(weightObj).reduce(
      (acc, [event, count]) => {
        console.log("event", event, "count", count);
        console.log("eventWeight", eventWeights[event]);
        return acc + count * eventWeights[event];
      },
      0
    );
    console.log("weightedSum", weightedSum);

    const averageSum = weightedSum / totalWeight;
    console.log("averageSum", averageSum);

    return [providerKey, averageSum];
  });

  console.log("weightedAverages", weightedAverages);
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
