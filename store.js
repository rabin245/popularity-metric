export function addToStore(key, eventType, count) {
  console.log(
    "adding to store for key",
    key,
    "event type",
    eventType,
    "count",
    count
  );
  // Get the stored data from localStorage
  let storedData = JSON.parse(localStorage.getItem("providersStore"));

  if (!storedData) {
    storedData = {};
  }

  if (!storedData[key]) {
    storedData[key] = {};
  }

  if (!storedData[key][eventType]) {
    storedData[key][eventType] = 0;
  }

  storedData[key][eventType] += count;

  // Save the updated data to localStorage
  localStorage.setItem("providersStore", JSON.stringify(storedData));
}

export function getValueFromStore(eventWeights) {
  // Get the stored data from localStorage
  const storedData = JSON.parse(localStorage.getItem("providersStore"));

  const eventTypes = Object.keys(eventWeights);

  // Initialize missing event counts to 0
  if (storedData) {
    Object.values(storedData).forEach((eventCountObj) => {
      eventTypes.forEach((event) => {
        if (eventCountObj[event] === undefined) {
          eventCountObj[event] = 0;
        }
      });
    });
  }

  return storedData;
}
