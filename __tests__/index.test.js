import {
  registerEventsAndWeights,
  resetEventWeightsMap,
  getEventWeightsMap,
} from "../index";

// Test suite
describe("registerEventsAndWeights", () => {
  // Reset eventWeightsMap before each test case
  beforeEach(() => {
    resetEventWeightsMap();
  });

  // Test case 1: Register single event and weight
  it("should register a single event and weight", () => {
    const eventsAndWeights = [["eventType1", 0.5]];

    const expectedEventWeightsMap = {
      eventType1: 0.5,
    };

    registerEventsAndWeights(eventsAndWeights);

    const eventWeightsMap = getEventWeightsMap();
    expect(eventWeightsMap).toEqual(expectedEventWeightsMap);
  });

  // Test case 2: Register multiple events and weights
  it("should registers multiple events and weights", () => {
    const eventsAndWeights = [
      ["eventType1", 0.3],
      ["eventType2", 0.7],
      ["eventType3", 0.1],
    ];
    const expectedEventWeightsMap = {
      eventType1: 0.3,
      eventType2: 0.7,
      eventType3: 0.1,
    };

    registerEventsAndWeights(eventsAndWeights);

    const eventWeightsMap = getEventWeightsMap();
    expect(eventWeightsMap).toEqual(expectedEventWeightsMap);
  });

  // Test case 3: Register events and weights with duplicate event types
  it("should not register events and weights with duplicate event types", () => {
    const eventsAndWeights = [
      ["eventType1", 0.4],
      ["eventType1", 0.8],
      ["eventType2", 0.6],
    ];
    const expectedEventWeightsMap = {
      eventType1: 0.8,
      eventType2: 0.6,
    };

    registerEventsAndWeights(eventsAndWeights);

    const eventWeightsMap = getEventWeightsMap();
    expect(eventWeightsMap).toEqual(expectedEventWeightsMap);
  });
});
