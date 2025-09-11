import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Lead() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    whatsapp: "",
    source: "",
    industry: "",
    address: "",
    status: "New",
  });
  const [updatingId, setUpdatingId] = useState(null);

  const API_URL = "http://localhost:5000/api/leads";

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(API_URL);
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching leads", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const prevStatus = leads.find((l) => l._id === id)?.status;
    setLeads((prev) =>
      prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
    );
    setUpdatingId(id);

    try {
      const res = await axios.patch(`${API_URL}/${id}/status`, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l._id === id ? res.data : l)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: prevStatus } : l))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/import`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchLeads();
      alert(`Imported ${res.data.count} leads`);
    } catch (err) {
      console.error(err);
      alert("CSV import failed");
    }
  };

  const exportCSV = async () => {
    try {
      const res = await axios.get(`${API_URL}/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "leads_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newLead);
      setShowModal(false);
      setNewLead({
        name: "",
        phone: "",
        email: "",
        whatsapp: "",
        source: "",
        industry: "",
        address: "",
        status: "New",
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
      alert("Failed to add lead");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesName = lead.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = filterDate
      ? new Date(lead.createdAt).toISOString().slice(0, 10) === filterDate
      : true;
    const matchesStatus = filterStatus ? lead.status === filterStatus : true;
    const matchesIndustry = filterIndustry
      ? lead.industry?.toLowerCase().includes(filterIndustry.toLowerCase())
      : true;

    return matchesName && matchesDate && matchesStatus && matchesIndustry;
  });

  const countByStatus = (status) => leads.filter((l) => l.status === status).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Leads Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white p-5 rounded-xl shadow-lg text-center">
          <div className="text-sm font-medium">Total Leads</div>
          <div className="text-2xl font-bold">{leads.length}</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-5 rounded-xl shadow-lg text-center">
          <div className="text-sm font-medium">In-progress</div>
          <div className="text-2xl font-bold">{countByStatus("In-progress")}</div>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-5 rounded-xl shadow-lg text-center">
          <div className="text-sm font-medium">Converted</div>
          <div className="text-2xl font-bold">{countByStatus("Converted")}</div>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white p-5 rounded-xl shadow-lg text-center">
          <div className="text-sm font-medium">Lost</div>
          <div className="text-2xl font-bold">{countByStatus("Lost")}</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="p-2 border rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="In-progress">In-progress</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
        <input
          type="text"
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          placeholder="Filter by industry..."
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <label className="px-4 py-2 bg-purple-600 text-white rounded cursor-pointer hover:bg-purple-700 transition">
          Import CSV
          <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
        </label>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Export CSV
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add Lead
        </button>
      </div>

      {/* Lead Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeads.map((lead, index) => (
          <div key={lead._id} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-700">
                #{index + 1} - {lead.name}
              </h4>
              <span className="text-xs text-gray-400">
                {new Date(lead.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1 text-gray-600 text-sm">
              <div>📞 {lead.phone || "-"}</div>
              <div>✉️ {lead.email || "-"}</div>
              {lead.whatsapp && <div>💬 {lead.whatsapp}</div>}
              <div>🏠 {lead.address || "-"}</div>
              <div>🌍 {lead.source || "-"}</div>
              <div>🏢 {lead.industry || "-"}</div>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <label className="text-sm">Status:</label>
              <select
                disabled={updatingId === lead._id}
                value={lead.status}
                onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                className="p-1 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In-progress">In-progress</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
              {updatingId === lead._id && (
                <span className="text-xs text-gray-500">Updating...</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl animate-slide-in">
            <h3 className="text-2xl font-bold mb-4 text-gray-700">Add New Lead</h3>
            <form onSubmit={handleAddLead} className="space-y-3">
              {["name","phone","email","whatsapp","address","source","industry"].map((field) => (
                <input
                  key={field}
                  required={field==="name"}
                  value={newLead[field]}
                  onChange={(e) => setNewLead({ ...newLead, [field]: e.target.value })}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              ))}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
