export function calculateWeightedMean(eventCounts, eventWeights) {
  //Convert object to array
  const arr = Object.entries(eventCounts);

  // get total sum of weights of registered events
  const totalWeight = Object.values(eventWeights).reduce(
    (acc, value) => acc + value,
    0
  );

  //Loop through array and calculate weightedMean for each key
  const weightedMeans = arr.map((value) => {
    const [providerKey, weightObj] = value;

    const weightedSum = Object.entries(weightObj).reduce(
      (acc, [event, count]) => {
        return acc + count * eventWeights[event];
      },
      0
    );

    const weightedMean = weightedSum / totalWeight;

    return [providerKey, weightedMean];
  });

  return weightedMeans;
}

export function sortWeights(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = sortWeights(arr.slice(0, mid));
  const right = sortWeights(arr.slice(mid));

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
