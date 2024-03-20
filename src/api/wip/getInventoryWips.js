import { API_CONFIG } from "../config";

export const getInventoryWips = () =>
  fetch(API_CONFIG.baseUrl + "/inventoryWips").then((response) => {
    if (!response.ok) {
      throw new Error("could not get statuses");
    }

    return response.json();
  });
