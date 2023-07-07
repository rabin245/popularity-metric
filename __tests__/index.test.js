import {
  registerEventsAndWeights,
  resetEventWeightsMap,
  getEventWeightsMap,
  trackEvent,
} from "../index";
import store from "../store";
import { jest } from "@jest/globals";

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

//Test Suite
describe("trackEvent", () => {
  let addToStoreMock;

  beforeEach(() => {
    addToStoreMock = jest.spyOn(store, "addToStore").mockImplementation();
  });

  afterEach(() => {
    addToStoreMock.mockRestore();
  });

  it("should call addToStore with the correct arguments after debounce delay ", () => {
    const eventType = "eventType1";
    const provider = "provider1";
    const count = 3;
    const debounceDelay = 5 * 1000; // 5 seconds

    trackEvent(eventType, provider, count);

    // Wait for the specified delay
    jest.advanceTimersByTime(debounceDelay);

    // expect(store.addToStore).toHaveBeenCalledTimes(1);
    expect(store.addToStore).toHaveBeenCalledWith(provider, eventType, count);
  });

  it("should debounce the function call for the same eventType", () => {
    const eventType = "eventType2";
    const provider = "provider2";
    const count = 1;
    const debounceDelay = 5 * 1000; // 5 seconds

    // Call trackEvent multiple times with the same eventType
    trackEvent(eventType, provider, count);
    trackEvent(eventType, provider, count);
    trackEvent(eventType, provider, count);

    jest.advanceTimersByTime(debounceDelay);

    expect(store.addToStore).toHaveBeenCalledTimes(1);
    expect(store.addToStore).toHaveBeenCalledWith(provider, eventType, count);
  });

  it("should call addToStore with the specified delay", () => {
    const eventType = "eventType3";
    const provider = "provider3";
    const count = 2;
    const delay = 1000; // Custom delay

    trackEvent(eventType, provider, count, delay);

    // Verify that addToStore is not called immediately
    expect(store.addToStore).not.toHaveBeenCalled();

    // Wait for the specified delay
    jest.advanceTimersByTime(delay);

    // expect(store.addToStore).toHaveBeenCalledTimes(1);
    expect(store.addToStore).toHaveBeenCalledWith(provider, eventType, count);
  });
});
