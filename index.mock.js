import { jest } from "@jest/globals";

let mockEventWeightsMap = {};

export const registerEventsAndWeights = jest
  .fn()
  .mockImplementation((eventsAndWeights) => {
    eventsAndWeights.forEach(([eventType, weight]) => {
      mockEventWeightsMap[eventType] = weight;
    });
  });

export const getMockEventWeightsMap = jest.fn(() => {
  return { ...mockEventWeightsMap };
});

export const resetMockEventWeightsMap = jest.fn(() => {
  mockEventWeightsMap = {};
});
