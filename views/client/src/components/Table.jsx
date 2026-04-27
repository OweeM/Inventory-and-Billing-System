
import React from "react";

const Table = () => {
  const data = [
    {
      invoice: "123456789",
      name: "John Doe",
      amount: "1011.23",
      time: "21:48",
      points: "50.55",
      action: "Required",
    },
    {
      invoice: "987654321",
      name: "Jane Smith",
      amount: "1154.70",
      time: "21:47",
      points: "577.00",
      action: "Completed",
    },
    {
      invoice: "456123789",
      name: "Michael Lee",
      amount: "2357.12",
      time: "21:45",
      points: "117.85",
      action: "Completed",
    },
  ];

  return (
    <table className="table-auto w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border-b">Invoice No.</th>
          <th className="p-3 border-b">Customer Name</th>
          <th className="p-3 border-b">Total Amount</th>
          <th className="p-3 border-b">Time</th>
          <th className="p-3 border-b">Points</th>
          <th className="p-3 border-b">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td className="p-3 border-b text-center">{row.invoice}</td>
            <td className="p-3 border-b text-center">{row.name}</td>
            <td className="p-3 border-b text-center">{row.amount}</td>
            <td className="p-3 border-b text-center">{row.time}</td>
            <td className="p-3 border-b text-center">{row.points}</td>
            <td className="p-3 border-b text-center">
              <span
                className={`px-2 py-1 text-sm font-medium rounded ${
                  row.action === "Required"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {row.action}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
