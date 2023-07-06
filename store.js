function getStoredData() {
  const storedData = JSON.parse(localStorage.getItem("providersStore"));
  return storedData ? new Map(Object.entries(storedData)) : new Map();
}

function setStoredData(dataMap) {
  const dataObj = Object.fromEntries(dataMap);
  localStorage.setItem("providersStore", JSON.stringify(dataObj));
}

export function addToStore(key, eventType, count) {
  key = String(key);
  console.log(
    "adding to store for key",
    key,
    "event type",
    eventType,
    "with count",
    count
  );
  // Get the stored data from localStorage
  const storedData = getStoredData();
  let eventData = storedData.get(key);

  if (!eventData) {
    eventData = {};
  }

  if (!eventData[eventType]) {
    eventData[eventType] = 0;
  }
  eventData[eventType] += count;
  storedData.set(key, eventData);

  // Save the updated data to localStorage
  setStoredData(storedData);
}

export function getValueFromStore(eventWeights) {
  // Get the stored data from localStorage
  const storedData = getStoredData();

  const eventTypes = [...eventWeights.keys()];

  // Initialize missing event counts to 0
  storedData.forEach((eventData, key) => {
    eventTypes.forEach((eventType) => {
      if (!eventData.hasOwnProperty(eventType)) {
        eventData[eventType] = 0;
      }
    });
  });

  const mappedEntries = Array.from(storedData.entries()).map(([key, value]) => [
    key,
    new Map(Object.entries(value)),
  ]);

  return new Map(mappedEntries);
}
