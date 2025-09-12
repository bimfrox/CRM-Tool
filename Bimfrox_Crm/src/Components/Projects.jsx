import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select"; // for multi-select team members
import { FaTrashAlt, FaPlus, FaSearch } from "react-icons/fa";

const API_URL = "https://bimfrox-crm.onrender.com/api/projects";
const TEAM_API = "https://bimfrox-crm.onrender.com/api/teammember";

const statusColors = {
  Planning: "bg-gray-400",
  "In Progress": "bg-yellow-500",
  "On Hold": "bg-orange-500",
  Completed: "bg-green-600",
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    startDate: "",
    deadline: "",
    status: "Planning",
    projectManager: "",
    teamMembers: [],
    budget: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchTeam();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await axios.get(TEAM_API);
      setTeam(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
      setProjects([...projects, res.data]);
      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        client: "",
        startDate: "",
        deadline: "",
        status: "Planning",
        projectManager: "",
        teamMembers: [],
        budget: "",
      });
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects
    .filter((p) => (activeTab === "all" ? true : p.status === activeTab))
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">📂 Projects</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded-lg"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
          >
            <FaPlus className="mr-2" /> Add Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "Planning", "In Progress", "On Hold", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg ${activeTab === tab ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      {loading ? (
        <p className="text-center text-gray-500">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-center text-gray-500">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div key={p._id} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{p.description}</p>
              <p className="mt-2 text-sm text-gray-500">
                Client: <b>{p.client || "N/A"}</b>
              </p>
              <p className="text-sm">Manager: {p.projectManager?.name || "Unassigned"}</p>
              <p className="text-sm">Status: <b>{p.status}</b></p>
              <p className="text-sm">💰 Budget: ${p.budget || 0}</p>
              {/* Progress bar */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${statusColors[p.status]}`}
                  style={{ width: p.status === "Completed" ? "100%" : p.status === "In Progress" ? "60%" : p.status === "Planning" ? "30%" : "20%" }}
                ></div>
              </div>
              <button
                onClick={() => deleteProject(p._id)}
                className="mt-4 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-1"
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-green-800">➕ Add Project</h2>
            <form onSubmit={addProject} className="space-y-3">
              <input
                type="text"
                placeholder="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />

              {/* Status */}
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>

              {/* Project Manager */}
              <select
                value={formData.projectManager}
                onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Assign Project Manager</option>
                {team.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>

              {/* Team Members (multi-select) */}
              <Select
                isMulti
                options={team.map((member) => ({ value: member._id, label: `${member.name} (${member.role})` }))}
                onChange={(selected) => setFormData({ ...formData, teamMembers: selected.map((s) => s.value) })}
                placeholder="Assign Team Members"
                className="w-full"
              />

              <input
                type="number"
                placeholder="Budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />

              {/* Modal Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
