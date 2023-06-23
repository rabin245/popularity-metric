const EVENT_TYPES = {
  CLICK: "click",
  CALL: "call",
};

const global_store = {};

const addToStore = (key, eventType, value) => {
  if (global_store[key][eventType] === undefined) {
    global_store[key][eventType] = 0;
  }
  global_store[key][eventType] += value;
};

function trackEvent(eventType, provider) {
  switch (eventType) {
    case EVENT_TYPES.CLICK:
      addToStore(provider, eventType, weight[eventType]);
      break;

    case EVENT_TYPES.CALL:
      addToStore(provider, eventType, 2);
      break;
    default:
      console.log("Unknown Event");
      break;
  }
}

function getStoreByPopularity() {
  const arr = Object.entries(global_store);
  const weightedArr = calculateWeightedAvg(arr);
  const sortedArr = mergeSort(arr);
  const sortedObj = Object.fromEntries(sortedArr);
  return sortedObj;
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

module.exports = {
  trackEvent,
  getStoreByPopularity,
  EVENT_TYPES,
};
