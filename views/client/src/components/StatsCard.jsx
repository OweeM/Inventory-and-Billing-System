import React from "react";

const StatsCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default StatsCard;