import store from "../store";

describe("addToStore", () => {
  beforeEach(() => {
    // Clear the localStorage before each test
    localStorage.clear();
  });

  it("should add count to the stored data", () => {
    const key = "provider1";
    const eventType = "time_on_page";
    const count = 5;

    store.addToStore(key, eventType, count);

    const storedData = JSON.parse(localStorage.getItem("providersStore"));

    expect(storedData[key][eventType]).toBe(count);
  });

  it("should increment count if the same key and eventType exist", () => {
    const key = "provider1";
    const eventType = "time_on_page";

    // Add initial count
    store.addToStore(key, eventType, 3);

    // Increment count
    store.addToStore(key, eventType, 2);

    const storedData = JSON.parse(localStorage.getItem("providersStore"));

    expect(storedData[key][eventType]).toBe(5);
  });
});

describe("getValueFromStore", () => {
  beforeEach(() => {
    // Clear the localStorage before each test
    localStorage.clear();
  });

  it("should return stored data with missing event counts initialized to 0", () => {
    const eventWeightsMap = {
      time_on_page: 0.1,
      call: 0.5,
      profile_view: 0.05,
      share: 0.35,
    };

    // Add some initial stored data
    const storedData = {
      provider1: {
        time_on_page: 5,
        call: 10,
      },
      provider2: {
        call: 3,
        profile_view: 8,
      },
    };

    localStorage.setItem("providersStore", JSON.stringify(storedData));

    const result = store.getValueFromStore(eventWeightsMap);

    expect(result).toEqual({
      provider1: {
        time_on_page: 5,
        call: 10,
        profile_view: 0,
        share: 0,
      },
      provider2: {
        time_on_page: 0,
        call: 3,
        profile_view: 8,
        share: 0,
      },
    });
  });

  it("should return empty object if no stored data exists", () => {
    const eventWeightsMap = {
      time_on_page: 0.1,
      call: 0.5,
      profile_view: 0.05,
      share: 0.35,
    };

    const result = store.getValueFromStore(eventWeightsMap);

    expect(result).toEqual({});
  });
});
