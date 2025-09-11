import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://bimfrox-crm.onrender.com/api/support";

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    issueType: "General",
    priority: "Low",
    message: "",
  });
  const [clickedStatus, setClickedStatus] = useState({}); // Track clicked buttons per ticket

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL, formData);
      setTickets([res.data, ...tickets]);
      setShowModal(false);
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        issueType: "General",
        priority: "Low",
        message: "",
      });
    } catch (err) {
      console.error("Error adding ticket:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { status });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? res.data : t))
      );
      // Mark this button as clicked
      setClickedStatus((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), status],
      }));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTickets(tickets.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  };

  const filteredTickets = tickets.filter((t) =>
    activeTab === "All" ? true : t.status === activeTab
  );

  const priorityColor = {
    Low: "bg-green-200 text-green-800",
    Medium: "bg-yellow-200 text-yellow-800",
    High: "bg-red-200 text-red-800",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-3xl font-extrabold text-green-800 drop-shadow-md">
          🎧 Support & Tickets
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transform transition"
        >
          + New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {["All", "New", "In Progress", "Resolved", "Closed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              activeTab === tab
                ? "bg-green-700 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-12 h-12 border-4 border-green-600 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No tickets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white p-5 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg text-gray-800">
                  {ticket.customerName}
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    priorityColor[ticket.priority] || "bg-gray-200 text-gray-800"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{ticket.message}</p>
              <p className="text-sm text-gray-500 mb-1">
                📅 {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mb-3">Status: {ticket.status}</p>

              {/* Status Buttons */}
              <div className="flex flex-wrap gap-2">
                {["In Progress", "Resolved", "Closed"].map((status) => {
                  const isClicked =
                    clickedStatus[ticket._id] &&
                    clickedStatus[ticket._id].includes(status);
                  if (isClicked) return null; // Hide clicked button
                  return (
                    <button
                      key={status}
                      onClick={() => updateStatus(ticket._id, status)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      {status}
                    </button>
                  );
                })}
                <button
                  onClick={() => deleteTicket(ticket._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-96 p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">
              ➕ New Support Ticket
            </h2>
            <form onSubmit={addTicket} className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <select
                value={formData.issueType}
                onChange={(e) =>
                  setFormData({ ...formData, issueType: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option>General</option>
                <option>Delivery</option>
                <option>Product</option>
                <option>Billing</option>
              </select>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <textarea
                placeholder="Describe the issue..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
