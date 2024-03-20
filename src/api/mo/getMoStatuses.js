import { API_CONFIG } from "../config";

export const getMoStatuses = () =>
  fetch(API_CONFIG.baseUrl + "/inventoryMoStatuses").then((response) => {
    if (!response.ok) {
      throw new Error("could not get statuses");
    }

    return response.json();
  });
