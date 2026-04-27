import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Import Navbar

const MembersPage = () => {
  // Initially, members state is an empty array.
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSorting, setIsSorting] = useState(false);

  // State for rewards stats fetched from MongoDB
  const [rewardsStats, setRewardsStats] = useState({
    totalPointsDistributed: 0,
    totalPointsRedeemed: 0,
  });

  // Fetch rewards stats from your API endpoint
  useEffect(() => {
    fetch("http://localhost:4000/api/rewards/stats", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setRewardsStats({
          totalPointsDistributed: data.totalPointsDistributed || 0,
          totalPointsRedeemed: data.totalPointsRedeemed || 0,
        });
      })
      .catch((error) =>
        console.error("Error fetching rewards stats:", error)
      );
  }, []);

  // NEW useEffect to fetch customers from the database
  useEffect(() => {
    fetch("http://localhost:4000/api/customers", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched customers data:", data);
        setMembers(data);
      })
      .catch((error) =>
        console.error("Error fetching customers:", error)
      );
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleHighRewardCustomers = () => {
    setIsSorting(true);
    setTimeout(() => {
      const sortedMembers = [...members].sort(
        (a, b) => b.rewardPoints - a.rewardPoints
      );
      setMembers(sortedMembers);
      setIsSorting(false);
    }, 300);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery) ||
      member.memberId.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="bg-white min-h-screen font-montserrat">
      {/* Navbar */}
      <div className="fixed top-0 left-[280px] w-[calc(100%-280px)] z-50 bg-white shadow-md">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="pt-[40px] pl-[140px] pr-8">
        {/* Search and filter section */}
        <h2 className="text-[22px] font-bold mb-4">Search and filter</h2>
        <div className="mb-8">
          {/* Search bar */}
          <div className="relative mb-4 w-[300px]">
            <input
              type="text"
              placeholder="Search for a member"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#4F7A94]"
              value={searchQuery}
              onChange={handleSearch}
            />
            <i className="fa-solid fa-magnifying-glass absolute right-3 top-3 text-gray-500"></i>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <button
              className="bg-[#4F7A94] text-white px-6 py-2 rounded-lg shadow mb-4 sm:mb-0 transition-transform duration-300"
              onClick={handleHighRewardCustomers}
            >
              High-reward customers
            </button>
          </div>
        </div>

        {/* Members table with scrollable container */}
        <div className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-400">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg max-w-[calc(100%-40px)] mx-auto">
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                  Customer Name
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                  Customer ID
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                  Reward Points
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-[#F9F9F9]"
                    } transition-all duration-500 ${
                      isSorting ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-700">{member.name}</td>
                    <td className="py-3 px-4 text-gray-700">{member.memberId}</td>
                    <td className="py-3 px-4 text-gray-700">{member.rewardPoints}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-4 text-gray-700 font-semibold"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;