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

You can register events and their corresponding weights using the `registerEventsAndWeights` function. Here's an example:

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

You can use the `trackEvent` function to track events and store their counts in localStorage. Here's an example:

```javascript
import { trackEvent } from "@zaxiya/popularity-metric";

// Track an event
trackEvent("num_of_review", "providerA", 1);
```

### Getting Store by Popularity

You can retrieve the stored event data and calculate the weighted averages using the `getStoreByPopularity` function. It returns an array sorted by popularity. Here's an example:

```javascript
import { getStoreByPopularity } from "@zaxiya/popularity-metric";

// Get the store by popularity
const storeByPopularity = getStoreByPopularity();
console.log(storeByPopularity);
```

### Tracking Time on Pages

You can track the time spent on specific pages using the `trackTimeOnPages` function. It allows you to define patterns for page URLs and tracks the time spent on matching pages. Here's an example:

```javascript
import { trackTimeOnPages } from "@zaxiya/popularity-metric";

trackTimeOnPages({
  weight: 0.1,
  patterns: [
    {
      pattern: /\/provider\/\w+/,
      splitPosition: 2,
    },
  ],
});
```

The trackTimeOnPages function takes an object with configuration options as its parameter.

- weight: This option allows you to assign a weight to the "time_on_page" metric. The weight determines the importance of the time spent on a page when calculating popularity metrics. You can adjust this value based on your specific requirements.

- patterns: This option is an array of pattern objects. Each pattern object specifies a regular expression pattern (pattern) that matches the URLs of the pages you want to track. You can define multiple patterns to track different types of pages. In the provided code example, the pattern /\/provider\/\w+/ is used to match URLs that contain "/provider/" followed by one or more word characters.

- splitPosition: This option is used to extract a specific part of the matched URL as the ID for every provider or page. The value you provide here determines the position of the segment that will be used as the ID. In the given example, 2 is used, indicating that the ID should be extracted from the second segment of the URL after the "/provider/" part.

## License

This package is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
