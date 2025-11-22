import React from "react";

export default function Sidebar({ activeSection, onSectionChange, userRole }) {
  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "clients", label: "Client Management", icon: "👥", adminOnly: true  },
    { id: "leads", label: "Leads & Opportunities", icon: "🎯", adminOnly: true  },
    { id: "projects", label: "Project Management", icon: "📂" },
    { id: "support", label: "Support & Ticketing", icon: "🎧" },
    { id: "team", label: "TeamMember", icon: "👩🏻‍💻" },
    { id: "task", label: "Daily Tasks", icon: "✅", },
    { id: "reminders", label: "Raguler Reminders", icon: "📢"},
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.adminOnly || userRole === "admin"
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">CRM</h1>
        <p className="text-sm text-gray-500 mt-1">Complete CRM Solution</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition 
                ${isActive ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition mt-2"
        >
          <span className="text-lg">🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
}
