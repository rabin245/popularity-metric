import { calculateWeightedAverage, sortWeights } from "../weightedAverage";

describe("calculate weighted average", () => {
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

    const totalWeight = Object.values(eventWeights).reduce(
      (acc, value) => acc + value,
      0
    );

    // const expectedWeightedAverage = [
    //   ["provider1", 15.75],
    //   ["provider2", 29],
    //   ["provider3", 1.3],
    //   ["provider4", 11.3],
    //   ["provider5", 45.45],
    // ];

    const expectedWeightedAverage = Object.entries(eventCounts).map(
      ([providerKey, weightObj]) => {
        const weightedSum = Object.entries(weightObj).reduce(
          (acc, [event, count]) => {
            return acc + count * eventWeights[event];
          },
          0
        );
        const averageSum = weightedSum / totalWeight;
        return [providerKey, averageSum];
      }
    );

    const weightedAverage = calculateWeightedAverage(eventCounts, eventWeights);

    expect(weightedAverage).toEqual(expectedWeightedAverage);
  });
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
