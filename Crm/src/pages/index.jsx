import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Dashboard from "../Components/Dashboard";
import Login from "./Login";
import Lead from "../Components/Lead";
import Task from "../Components/Task";
import Team from "../Components/Team";
import Client from "../Components/Client";
import Support from "../Components/Support";
import Projects from "../Components/Projects";
import Reminder from "../Components/Reminder";

export default function Index({ onLogout }) {
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("activeSection") || "dashboard"
  );
  const [user, setUser] = useState(null);

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ username: payload.username, role: payload.role });
    }
  }, []);

  // Save active section
  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  if (!user) return <Login onLogin={setUser} />;

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "leads": return <Lead />;
      case "task": return <Task />;
      case "team": return <Team />;
      case "clients": return <Client />;
      case "support": return <Support />;
      case "projects": return <Projects />;
      case "reminders": return <Reminder />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={user.role}
        onLogout={onLogout}
      />
      <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
    </div>
  );
}
