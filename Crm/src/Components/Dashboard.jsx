import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaUsers, FaTasks, FaUserTie } from "react-icons/fa"; // Icons

const Dashboard = () => {
  const [leadsCount, setLeadsCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, teamRes, tasksRes] = await Promise.all([
          axios.get("https://bimfrox-crm.onrender.com/api/leads"),
          axios.get("https://bimfrox-crm.onrender.com/api/teammember"),
          axios.get("https://bimfrox-crm.onrender.com/api/tasks"),
        ]);

        setLeadsCount(leadsRes.data.length);
        setTeamCount(teamRes.data.length);
        setTasksCount(tasksRes.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const chartData = [
    { name: "Leads", total: leadsCount },
    { name: "Team", total: teamCount },
    { name: "Tasks", total: tasksCount },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-5 rounded-2xl shadow-lg flex items-center gap-4 transform hover:-translate-y-1 transition">
          <div className="text-white text-4xl">
            <FaUsers />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Total Leads</h2>
            <p className="text-white font-bold text-3xl">{leadsCount}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-5 rounded-2xl shadow-lg flex items-center gap-4 transform hover:-translate-y-1 transition">
          <div className="text-white text-4xl">
            <FaUserTie />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Team Members</h2>
            <p className="text-white font-bold text-3xl">{teamCount}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-5 rounded-2xl shadow-lg flex items-center gap-4 transform hover:-translate-y-1 transition">
          <div className="text-white text-4xl">
            <FaTasks />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Tasks</h2>
            <p className="text-white font-bold text-3xl">{tasksCount}</p>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-gray-700 font-bold text-xl mb-4">Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#555" />
            <YAxis stroke="#555" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="total"
              fill="#22c55e"
              radius={[8, 8, 0, 0]}
              barSize={40}
              background={{ fill: "#e5e7eb" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
