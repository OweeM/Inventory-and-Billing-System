import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/notifications");
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${id}`, { status: "Read" });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id ? { ...notification, status: "Read" } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/notifications/${id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "Unread") {
      return notification.status === "Unread";
    } else if (filter === "Critical") {
      return notification.priority === "High";
    }
    return true;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold p-4 border-b border-gray-200">Notifications</h1>
        <div className="flex justify-between px-4 py-2 border-b border-gray-200">
          <div>
            <button
              className={`px-4 py-2 text-sm font-medium ${filter === "All" ? "text-blue-600" : "text-gray-600"} hover:bg-gray-100 rounded transition duration-300 ease-in-out transform hover:scale-105`}
              onClick={() => setFilter("All")}
              style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit" }}
            >
              All ({notifications.length})
            </button>
            <button
              className={`ml-4 px-4 py-2 text-sm font-medium ${filter === "Unread" ? "text-blue-600" : "text-gray-600"} hover:bg-gray-100 rounded transition duration-300 ease-in-out transform hover:scale-105`}
              onClick={() => setFilter("Unread")}
              style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit" }}
            >
              Unread ({notifications.filter(n => n.status === "Unread").length})
            </button>
            <button
              className={`ml-4 px-4 py-2 text-sm font-medium ${filter === "Critical" ? "text-blue-600" : "text-gray-600"} hover:bg-gray-100 rounded transition duration-300 ease-in-out transform hover:scale-105`}
              onClick={() => setFilter("Critical")}
              style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit" }}
            >
              Critical Alerts ({notifications.filter(n => n.priority === "High").length})
            </button>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredNotifications.map((notification, index) => (
            <li
              key={index}
              className={`flex justify-between items-center p-4 hover:bg-gray-50 ${
                notification.priority === "High" ? "bg-red-50" : ""
              }`}
            >
              <div>
                <h2 className="text-lg font-medium text-gray-900">{notification.type}</h2>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex space-x-4">
                <button
                  className="text-sm text-green-600 hover:underline transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => markAsRead(notification._id)}
                  disabled={notification.status === "Read"}
                  style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit" }}
                >
                  {notification.status === "Read" ? "Read" : "Mark as Read"}
                </button>
                <button
                  className="text-sm text-red-600 hover:underline transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => deleteNotification(notification._id)}
                  style={{ fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationPage;