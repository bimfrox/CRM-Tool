import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import {
  format,
  parse,  
  startOfWeek,
  getDay,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});
const DnDCalendar = withDragAndDrop(Calendar);

// Ask browser notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

export default function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    priority: "Normal",
    category: "General",
    recurring: "none",
    email: "",
  });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("");
  const [view, setView] = useState("month");

  const API_BASE = "https://bimfrox-crm.onrender.com/api/reminders";

  // Load reminders
  useEffect(() => {
    axios
      .get(API_BASE)
      .then((res) => {
        // Ensure res.data is an array
        const data = Array.isArray(res.data) ? res.data : [];
        const events = data.map((r) => ({
          ...r,
          start: new Date(r.start),
          end: new Date(r.end),
        }));
        setReminders(events);
      })
      .catch((err) => console.error("Error fetching reminders:", err));
  }, []);

  // Local notifications
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      reminders.forEach((r) => {
        const reminderTime = new Date(r.start);
        const diff = reminderTime.getTime() - now.getTime();
        if (diff > 0 && diff <= 15 * 60 * 1000) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⏰ Reminder Alert", {
              body: `${r.title} at ${reminderTime.toLocaleTimeString()}`,
            });
          }
        }
      });
    };
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) return;

    const startDate = new Date(`${formData.date}T${formData.time}`);
    const newReminder = {
      ...formData,
      start: startDate,
      end: new Date(startDate.getTime() + 60 * 60 * 1000),
    };

    try {
      let res;
      if (editing) {
        res = await axios.put(`${API_BASE}/${editing._id}`, newReminder);
        setReminders(
          reminders.map((r) =>
            r._id === editing._id
              ? { ...res.data, start: new Date(res.data.start), end: new Date(res.data.end) }
              : r
          )
        );
      } else {
        res = await axios.post(API_BASE, newReminder);
        setReminders([
          ...reminders,
          { ...res.data, start: new Date(res.data.start), end: new Date(res.data.end) },
        ]);
      }
      setFormData({
        title: "",
        date: "",
        time: "",
        priority: "Normal",
        category: "General",
        recurring: "none",
        email: "",
      });
      setEditing(null);
    } catch (err) {
      console.error("Error saving reminder:", err);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setReminders(reminders.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  const moveReminder = async ({ event, start, end }) => {
    const updated = { ...event, start, end };
    try {
      await axios.put(`${API_BASE}/${event._id}`, updated);
      setReminders(
        reminders.map((r) =>
          r._id === event._id
            ? { ...updated, start: new Date(start), end: new Date(end) }
            : r
        )
      );
    } catch (err) {
      console.error("Error moving reminder:", err);
    }
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Reminders (Calendar)</h2>

      {/* Filter + Views */}
      <div className="flex gap-3 mb-6">
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Priorities</option>
          <option>High</option>
          <option>Normal</option>
          <option>Low</option>
        </select>
        <button onClick={() => setView("month")} className="px-3 py-1 bg-gray-200 rounded">Month</button>
        <button onClick={() => setView("week")} className="px-3 py-1 bg-gray-200 rounded">Week</button>
        <button onClick={() => setView("day")} className="px-3 py-1 bg-gray-200 rounded">Day</button>
        <button onClick={() => setView("agenda")} className="px-3 py-1 bg-gray-200 rounded">Agenda</button>
      </div>

      {/* Add/Edit Form */}
      <form onSubmit={saveReminder} className="mb-6 grid gap-3 max-w-lg">
        <input type="text" name="title" placeholder="Reminder title" value={formData.title} onChange={handleChange} className="p-2 border rounded" />
        <div className="flex gap-3">
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="p-2 border rounded w-1/2" />
          <input type="time" name="time" value={formData.time} onChange={handleChange} className="p-2 border rounded w-1/2" />
        </div>
        <select name="priority" value={formData.priority} onChange={handleChange} className="p-2 border rounded">
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>
        <select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded">
          <option>General</option>
          <option>Work</option>
          <option>Personal</option>
          <option>Meeting</option>
        </select>
        <select name="recurring" value={formData.recurring} onChange={handleChange} className="p-2 border rounded">
          <option value="none">No Repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <input type="email" name="email" placeholder="Your email" value={formData.email} onChange={handleChange} className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{editing ? "Update Reminder" : "Add Reminder"}</button>
      </form>

      {/* Calendar */}
      <div className="h-[600px] bg-white rounded shadow p-3">
        <DnDCalendar
          localizer={localizer}
          events={filter ? reminders.filter((r) => r.priority === filter) : reminders}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          style={{ height: 500 }}
          onEventDrop={moveReminder}
          resizable
          onEventResize={moveReminder}
          eventPropGetter={(event) => {
            let bg = "#9CA3AF";
            if (event.priority === "High") bg = "#EF4444";
            if (event.priority === "Low") bg = "#10B981";
            if (new Date(event.end) < new Date()) bg = "#6B7280";
            return { style: { backgroundColor: bg, color: "white" } };
          }}
          onSelectEvent={(event) => {
            if (window.confirm(`Delete reminder: ${event.title}?`)) {
              setEditing(event);
              setFormData({
                title: event.title,
                date: event.start.toISOString().split("T")[0],
                time: event.start.toTimeString().slice(0, 5),
                priority: event.priority,
                category: event.category,
                recurring: event.recurring,
                email: event.email || "",
              });
            }
          }}
          tooltipAccessor={(event) =>
            `${event.title}\n${event.priority} Priority\n${event.start.toLocaleString()} - ${event.end.toLocaleString()}`
          }
        />
      </div>
    </div>
  );
}
