import { calculateWeightedMean, sortWeights } from "../weightedMean";

describe("calculate weighted means", () => {
  it("should calculate the weighted mean for each key", () => {
    const eventCounts = {
      provider1: {
        time_on_page: 40,
        call: 10,
        profile_view: 100,
        share: 5,
      },
      provider2: {
        time_on_page: 20,
        call: 20,
        profile_view: 200,
        share: 20,
      },
      provider3: {
        time_on_page: 3,
        call: 1,
        profile_view: 10,
        share: 0,
      },
      provider4: {
        time_on_page: 15,
        call: 9,
        profile_view: 50,
        share: 8,
      },
      provider5: {
        time_on_page: 45,
        call: 43,
        profile_view: 256,
        share: 19,
      },
    };

    const eventWeights = {
      time_on_page: 0.1,
      call: 0.5,
      profile_view: 0.05,
      share: 0.35,
    };

    // const expectedWeightedMean = [
    //   ["provider1", 15.75],
    //   ["provider2", 29],
    //   ["provider3", 1.3],
    //   ["provider4", 11.3],
    //   ["provider5", 45.45],
    // ];

    const expectedWeightedMeans = calculateExpectedWeightedMean(
      eventCounts,
      eventWeights
    );

    const weightedMeans = calculateWeightedMean(eventCounts, eventWeights);

    expect(weightedMeans).toEqual(expectedWeightedMeans);
  });

  it("should handle empty eventWeights object", () => {
    const eventCounts = {
      provider1: { eventType1: 3, eventType2: 2 },
      provider2: { eventType1: 5, eventType2: 4 },
    };
    const eventWeights = {};

    const expectedWeightedMeans = calculateExpectedWeightedMean(
      eventCounts,
      eventWeights
    );

    const result = calculateWeightedMean(eventCounts, eventWeights);

    expect(result).toEqual(expectedWeightedMeans);
  });

  it("should handle zero total weight", () => {
    const eventCounts = {
      provider1: { eventType1: 3, eventType2: 2 },
      provider2: { eventType1: 5, eventType2: 4 },
    };
    const eventWeights = {
      eventType1: 0,
      eventType2: 0,
    };

    const expectedWeightedMeans = calculateExpectedWeightedMean(
      eventCounts,
      eventWeights
    );

    const result = calculateWeightedMean(eventCounts, eventWeights);

    expect(result).toEqual(expectedWeightedMeans);
  });

  function calculateExpectedWeightedMean(eventCounts, eventWeights) {
    const totalWeight = Object.values(eventWeights).reduce(
      (acc, value) => acc + value,
      0
    );

    return Object.entries(eventCounts).map(([providerKey, weightObj]) => {
      const weightedSum = Object.entries(weightObj).reduce(
        (acc, [event, count]) => {
          return acc + count * eventWeights[event];
        },
        0
      );

      const weightedMean = weightedSum / totalWeight;
      return [providerKey, weightedMean];
    });
  }
});

describe("sortWeights", () => {
  it("should sort the array of weights in descending order", () => {
    const weights = [
      ["provider1", 15.75],
      ["provider2", 29],
      ["provider3", 1.3],
      ["provider4", 11.3],
      ["provider5", 45.45],
    ];
    const sortedWeights = sortWeights(weights);

    const expectedSortedWeights = [
      ["provider5", 45.45],
      ["provider2", 29],
      ["provider1", 15.75],
      ["provider4", 11.3],
      ["provider3", 1.3],
    ];
    expect(sortedWeights).toEqual(expectedSortedWeights);
  });

  it("should return the same array if it contains only one element", () => {
    const weights = [["provider1", 15.75]];
    const sortedWeights = sortWeights(weights);

    expect(sortedWeights).toEqual(weights);
  });

  it("should return an empty array if the input array is empty", () => {
    const weights = [];
    const sortedWeights = sortWeights(weights);

    expect(sortedWeights).toEqual([]);
  });
});
