import { API_CONFIG } from "../config";

export const createMoStatus = ({
  mohId,
  status,
  user,
  lastUpdate,
  createdAt,
}) => {
  // console.log(userId);
  return fetch(API_CONFIG.baseUrl + "/inventoryMoStatuses", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      mohId,
      status,
      user,
      lastUpdate,
      createdAt,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("create mo Status failed");
      }
      return response;
    })
    .then((response) => {
      return response.json();
    });
};
