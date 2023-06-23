const example_EVENT_TYPES = {
  NUM_OF_REVIEW: "num_of_review",
  AVERAGE_RATING: "average_rating",
  PROFILE_VIEWS: "profile_views",
  FAVORITES: "favorites",
  SHARE_LINK: "share_link",
  SHARE_EMAIL: "share_email",
  SHARE_FACEBOOK: "share_facebook",
  SHARE_TWITTER: "share_twitter",
  SHARE_INSTAGRAM: "share_instagram",
  SHARE_WHATSAPP: "share_whatsapp",
  SHARE_VIBER: "share_viber",
  CALL: "call",
};

// Weight of each metric/key (sum of all weights should be 1)
const example_weight = {
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

let weights = {};

// Event values for each provider
const global_store = {
  provider_1: {
    num_of_review: 10,
    average_rating: 4.5,
    profile_views: 100,
    favorites: 5,
    share_link: 2,
    share_email: 0,
    share_facebook: 2,
    share_twitter: 9,
    share_instagram: 7,
    share_whatsapp: 0,
    share_viber: 0,
    call: 5,
  },
  provider_2: {
    num_of_review: 8,
    average_rating: 4,
    profile_views: 121,
    favorites: 8,
    share_link: 3,
    share_email: 0,
    share_facebook: 2,
    share_twitter: 9,
    share_instagram: 7,
    share_whatsapp: 0,
    share_viber: 0,
    call: 2,
  },
};

const addToStore = (key, eventType, value) => {
  if (global_store[key][eventType] === undefined) {
    global_store[key][eventType] = 0;
  }
  global_store[key][eventType] += value;
};

function trackEvent(eventType, provider) {
  addToStore(provider, eventType, weights[eventType]);
}

function getStoreByPopularity() {
  const global_store = getValueFromStore();
  const weightedArr = calculateWeightedAverage(global_store);
  const sortedArr = mergeSort(weightedArr);
  const sortedObj = Object.fromEntries(sortedArr);
  console.log(sortedObj);
  return sortedObj;
}

function getValueFromStore() {
  return global_store;
}

function calculateWeightedAverage(counts) {
  //Convert object to array
  const arr = Object.entries(counts);
  //Loop through array and calculate for each key
  const sum = arr.map((value) => {
    const [key, valueObj] = value;
    // Loop through each object and calculate weighted average
    const sum = Object.entries(valueObj).reduce((acc, [key, value]) => {
      return acc + value * weights[key];
    }, 0);
    return [key, sum];
  });
  return sum;
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

function registerEventsAndWeights(data) {
  weights[data.eventType] = data.weight;
}

getStoreByPopularity();

module.exports = {
  trackEvent,
  getStoreByPopularity,
  EVENT_TYPES,
  registerEventsAndWeights,
};
