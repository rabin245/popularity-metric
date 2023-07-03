import { addToStore } from "./store";

export function checkPathNameAndStoreTime(path, patterns) {
  patterns.forEach(({ pattern, splitPosition = 2 }) => {
    const regex = new RegExp(pattern);
    if (regex.test(path)) {
      incrementTimeOnPath(path, splitPosition);
      return;
    }
  });
}

function incrementTimeOnPath(path, splitPosition) {
  // assume path is like /provider/:id
  const id = path.split("/")[splitPosition];
  addToStore(id, "time_on_page", 5);
}
