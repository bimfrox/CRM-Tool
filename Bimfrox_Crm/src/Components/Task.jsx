import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

const TASK_API = "http://localhost:5000/api/tasks";
const TEAM_API = "http://localhost:5000/api/teammember";

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "Medium",
    dueDate: "",
  });

  useEffect(() => {
    loadTasks();
    loadTeam();
  }, []);

  const loadTasks = async () => {
    const res = await axios.get(TASK_API);
    setTasks(res.data);
  };

  const loadTeam = async () => {
    const res = await axios.get(TEAM_API);
    setTeam(res.data);
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("Title is required");

    const res = await axios.post(TASK_API, form);
    setTasks([...tasks, res.data]);
    setForm({ title: "", description: "", assignee: "", priority: "Medium", dueDate: "" });
  };

  const toggleTask = async (task) => {
    const updated = { ...task, status: task.status === "Pending" ? "Completed" : "Pending" };
    await axios.put(`${TASK_API}/${task._id}`, updated);
    loadTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete task?")) return;
    await axios.delete(`${TASK_API}/${id}`);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "Today") {
        return t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
      }
      if (filter === "Upcoming") {
        return t.dueDate && new Date(t.dueDate) > new Date();
      }
      if (filter === "Completed") return t.status === "Completed";
      return true;
    })
    .filter((t) => (t?.title || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Task Manager</h2>

      {/* Add Task */}
      <form onSubmit={createTask} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2"
          />
          <select
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            className="border p-2"
          >
            <option value="">Select Assignee</option>
            {team.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 col-span-2"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="border p-2"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="border p-2"
          />
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Add Task</button>
      </form>

      {/* Filters + Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          {["All", "Today", "Upcoming", "Completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded ${filter === f ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2"
        />
      </div>

      {/* Task List */}
      <div className="bg-white rounded shadow divide-y">
        {filteredTasks.map((task) => (
          <div key={task._id} className="p-4 flex justify-between items-center">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.status === "Completed"}
                  onChange={() => toggleTask(task)}
                />
                <span className={task.status === "Completed" ? "line-through text-gray-500" : ""}>
                  {task.title}
                </span>
              </label>
              <div className="text-sm text-gray-600 ml-6">
                {task.assignee && <span>👤 {task.assignee?.name} • </span>}
                {task.dueDate && <span>📅 {format(new Date(task.dueDate), "yyyy-MM-dd")}</span>}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className={`px-2 py-1 text-xs rounded text-white ${
                task.priority === "High" ? "bg-red-500" :
                task.priority === "Low" ? "bg-green-500" : "bg-yellow-500"
              }`}>
                {task.priority}
              </span>
              <button onClick={() => deleteTask(task._id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && <p className="p-4 text-gray-500">No tasks found</p>}
      </div>
    </div>
  );
}
