import React, { createContext, useState } from "react";

export const BillingContext = createContext();

export const BillingProvider = ({ children }) => {
  const [billingData, setBillingData] = useState({
    customerDetails: { name: "", email: "", memberID: "", rewardPoints: 0 },
    billingItems: [{ code: "", description: "", qty: 1, unitPrice: "", rewards: "", amount: 0 }],
    totalPrice: 0,
  });

  return (
    <BillingContext.Provider value={{ billingData, setBillingData }}>
      {children}
    </BillingContext.Provider>
  );
};