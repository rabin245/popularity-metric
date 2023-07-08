# Popularity Metric

[![npm version](https://img.shields.io/npm/v/@zaxiya/popularity-metric.svg)](https://www.npmjs.com/package/@zaxiya/popularity-metric)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Description

Calculte the popularity of items using certain metrics like clicks, shares, etc.

## Installation

Install the package using npm:

```
npm install @zaxiya/popularity-metric
```

## Usage

### Registering Events and Weights

#### `registerEventsAndWeights(eventsAndWeights)`

Registers events and their corresponding weights. The eventsAndWeights parameter is an array of arrays, where each sub-array contains the event type and its weight.

```javascript
import { registerEventsAndWeights } from "@zaxiya/popularity-metric";

// Register events and weights
registerEventsAndWeights([
  ["num_of_review", 0.2],
  ["average_rating", 0.25],
  // Add more events and weights
]);
```

### Tracking Events

#### `trackEvent(eventType, provider, count, delay)`

Tracks a specific event and stores it with the given provider. The eventType parameter specifies the type of event, provider is the identifier for the event source, count is the number of times the event occurred, and delay (optional) is the debounce delay in milliseconds (default: 5000).

```javascript
import { trackEvent } from "@zaxiya/popularity-metric";

// Track an event
trackEvent("num_of_review", "providerA", 1);
```

### Checking user activity between checkpoints

#### `checkUserActivityBetweenCheckpoints({ weight, id, checkPoints })`

Checks if the user is active between every checkpoint and adds a point to the "time_on_page" event. The weight parameter specifies the weight of the "time_on_page" event, id is the identifier for the page or provider, and checkPoints (optional) is an array of time checkpoints in milliseconds where the "time_on_page" event will be triggered.

#### `stopCheckingUserActivity()`

Stops checking user activity between checkpoints and removes event listeners.

```javascript
import { trackTimeOnPages } from "@zaxiya/popularity-metric";

// Track time on pages
checkUserActivityBetweenCheckpoints({
  weight: 0.05,
  id: "homepage",
  checkPoints: [10000, 30000, 60000],
});

// some code...
stopCheckingUserActivity();
```

### Calculate the popularity ranking

#### `calculatePopularityRanking()`

Calculates the popularity of events based on their weights and returns the sorted result.

```javascript
import { calculatePopularityRanking } from "@zaxiya/popularity-metric";

// Calculate the popularity ranking
const popularityRanking = calculatePopularityRanking();
console.log(popularityRanking);
```

This function calculates the popularity ranking of events stored in the providersStore. It uses the weights associated with each event type to calculate a weighted mean for each provider. The result is an array of provider-weight pairs, sorted in descending order of popularity.

Note that you should ensure that the necessary event weights and data are registered and stored before calling this function.

## License

This package is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
