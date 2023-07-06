function getStoredData() {
  return JSON.parse(localStorage.getItem("providersStore")) || {};
}

function setStoredData(data) {
  localStorage.setItem("providersStore", JSON.stringify(data));
}

export function addToStore(key, eventType, count) {
  console.log("adding to store for key", key, "event type", eventType);
  // Get the stored data from localStorage
  const storedData = getStoredData();

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
  setStoredData(storedData);
}

export function getValueFromStore(eventWeights) {
  // Get the stored data from localStorage
  const storedData = getStoredData();

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
