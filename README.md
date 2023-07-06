# Popularity Metric

[![npm version](https://img.shields.io/npm/v/@zaxiya/popularity-metric.svg)](https://www.npmjs.com/package/@zaxiya/popularity-metric)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Description

Calculte the popularity of items using certain metrics like clicks, shares, time spent on page etc.

## Installation

Install the package using npm:

```
npm install @zaxiya/popularity-metric
```

## Usage

### Registering Events and Weights

You can register events and their corresponding weights using the `registerEventsAndWeights` function. The weights determine the importance of each event when calculating the overall popularity. Here's an example:

```javascript
import { registerEventsAndWeights } from "@zaxiya/popularity-metric";

// Register events and weights
registerEventsAndWeights([
  ["num_of_review", 0.2],
  ["favorite", 0.25],
  // Add more events and weights
]);
```

### Setting Custom Time Thresholds

You can customize the time thresholds used for tracking user activity by calling the registerTimeThresholds function. **It's important to note that the customThrottleDelay time should be less than the customActiveTimeThreshold time, preferably around half of it.**

```javascript
import { registerTimeThresholds } from "@zaxiya/popularity-metric";

registerTimeThresholds({
  customActiveTimeThreshold: 5000, // 5 seconds
  customThrottleDelay: 2500, // 2.5 seconds
  customDebounceDelay: 5000, // 5 seconds
});
```

Make sure to adjust the `customThrottleDelay` value accordingly to ensure accurate tracking of user activity. Feel free to experiment with different values to suit your specific needs.

### Registering Tracked Events

Specify the events that you want to track using the registerTrackedEvents function. By default, the package tracks the following events: "mouseup", "keydown", "scroll", and "mousemove".

```javascript
import { registerTrackedEvents } from "@zaxiya/popularity-metric";

registerTrackedEvents(["mouseup", "keydown", "scroll", "mousemove"]);
```

### Tracking Events

You can track events and their occurrence count using the trackEvent function. The events will be debounced based on the specified delay (defaults to the debounce delay set during initialization).

```javascript
import { trackEvent } from "@zaxiya/popularity-metric";

// Track an event
trackEvent("num_of_review", "providerA", 1);
```

### Tracking Time on Pages

You can track the time spent on specific pages using the `trackTimeOnPages` function. To start tracking time on the page, use the startTrackingTimeOnPage function. You can provide a weight and an identifier for the current provider. To end the time tracking, call the endTrackingTimeOnPage function.

```javascript
import {
  startTrackingTimeOnPage,
  endTrackingTimeOnPage,
} from "@zaxiya/popularity-metric";

// Track time on pages
startTrackingTimeOnPage({ weight: 0.7, id: "providerA" });

// some code...
endTrackingTimeOnPage();
```

### Getting Store by Popularity

You can retrieve the stored event data and calculate the weighted averages using the `getStoreByPopularity` function. It returns an array sorted by popularity. Here's an example:

```javascript
import { getStoreByPopularity } from "@zaxiya/popularity-metric";

// Get the store by popularity
const storeByPopularity = getStoreByPopularity();
console.log(storeByPopularity);
```

## License

This package is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
