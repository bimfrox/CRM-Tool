// frontend/src/pages/Client.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaMoneyBillWave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
} from "react-icons/fa";

const API_URL = "https://bimfrox-crm.onrender.com/api/clients"; // ✅ Local API

const Client = () => {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    bname: "",
    contact: "",
    services: "",
    startDate: "",
    endDate: "",
    totalAmount: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  // ✅ Fetch Clients
  const fetchClients = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  // ✅ Add Client
  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      setFormData({
        clientId: "",
        name: "",
        bname: "",
        contact: "",
        services: "",
        startDate: "",
        endDate: "",
        totalAmount: "",
      });
      setShowForm(false);
      fetchClients();
    } catch (err) {
      console.error("Error adding client:", err);
    }
  };

  // ✅ Update Client Field
  const updateClientField = async (id, field, value) => {
    try {
      await axios.put(`${API_URL}/${id}`, { [field]: value });
      fetchClients();
    } catch (err) {
      console.error("Error updating client:", err);
    }
  };

  // ✅ Delete Client
  const deleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  // ✅ Filter + Search Clients
  const filteredClients = clients.filter((c) => {
    const matchesFilter =
      filter === "All"
        ? true
        : c.status === filter || c.paymentStatus === filter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.bname.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ✅ Dashboard Stats
  const totalProjects = clients.length;
  const totalPayments = clients.reduce(
    (sum, c) => sum + (c.totalAmount || 0),
    0
  );

  // ✅ Badge Colors
  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Completed: "bg-blue-100 text-blue-800",
    "On-hold": "bg-yellow-100 text-yellow-800",
  };
  const paymentColors = {
    Pending: "bg-red-100 text-red-700",
    "Half Paid": "bg-yellow-100 text-yellow-700",
    "Full Paid": "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-blue-800">👥 Client Projects</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          <FaPlus className="mr-2" /> {showForm ? "Close" : "Add Client"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-6 rounded-xl shadow text-white">
          <h3 className="font-medium">Total Projects</h3>
          <p className="text-3xl font-bold">{totalProjects}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-xl shadow text-white">
          <h3 className="font-medium">Total Payments</h3>
          <p className="text-3xl font-bold">₹{totalPayments}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center w-full sm:w-1/2 bg-white border rounded-lg px-3 py-2 shadow">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>
        <select
          className="border px-3 py-2 rounded-lg shadow"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On-hold">On-hold</option>
          <option value="Pending">Pending</option>
          <option value="Half Paid">Half Paid</option>
          <option value="Full Paid">Full Paid</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleAddClient}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white border rounded-xl shadow"
        >
          {["clientId", "name", "bname", "contact", "services"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.replace(/^\w/, (c) => c.toUpperCase())}
              value={formData[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-3 rounded-lg"
              required
            />
          ))}
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="border p-3 rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Total Amount"
            value={formData.totalAmount}
            onChange={(e) =>
              setFormData({ ...formData, totalAmount: e.target.value })
            }
            className="border p-3 rounded-lg"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Save Client
          </button>
        </form>
      )}

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((c) => {
          const progress =
            ((new Date() - new Date(c.startDate)) /
              (new Date(c.endDate) - new Date(c.startDate))) *
            100;
          return (
            <div
              key={c._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{c.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteClient(c._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                  <button className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                </div>
              </div>
              <p className="text-gray-600">{c.bname}</p>
              <p className="text-sm text-gray-500 mb-2">{c.contact}</p>
              <p className="text-gray-700 mb-2">Services: {c.services}</p>

              {/* Status + Payment */}
              <div className="flex gap-2 mb-2">
                <span
                  onClick={() =>
                    updateClientField(
                      c._id,
                      "status",
                      c.status === "Active"
                        ? "Completed"
                        : c.status === "Completed"
                        ? "On-hold"
                        : "Active"
                    )
                  }
                  className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                    statusColors[c.status] || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {c.status}
                </span>
                <span
                  onClick={() =>
                    updateClientField(
                      c._id,
                      "paymentStatus",
                      c.paymentStatus === "Pending"
                        ? "Half Paid"
                        : c.paymentStatus === "Half Paid"
                        ? "Full Paid"
                        : "Pending"
                    )
                  }
                  className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                    paymentColors[c.paymentStatus] ||
                    "bg-gray-200 text-gray-700"
                  }`}
                >
                  {c.paymentStatus}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                ></div>
              </div>

              <p className="font-bold text-green-700">₹{c.totalAmount}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Client;
