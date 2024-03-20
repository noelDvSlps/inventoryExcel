import { API_CONFIG } from "../config";

export const createInventoryWip = ({
  mohId,
  item,
  wipQty,
  user,
  lastUpdate,
  createdAt,
}) => {
  // console.log(userId);
  return fetch(API_CONFIG.baseUrl + "/inventoryWips", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      mohId,
      item,
      wipQty,
      user,
      lastUpdate,
      createdAt,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("create mo failed");
      }
      return response;
    })
    .then((response) => {
      return response.json();
    });
};
