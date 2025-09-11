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
import enUS from "date-fns/locale/en-US"; // ✅ FIXED
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    priority: "Normal",
  });

  // Load reminders from backend
  useEffect(() => {
    axios.get("https://bimfrox-crm.onrender.com/api/reminders").then((res) => {
      // Ensure dates are parsed as JS Date objects
      const events = res.data.map((r) => ({
        ...r,
        start: new Date(r.start),
        end: new Date(r.end),
      }));
      setReminders(events);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) return;

    const startDate = new Date(`${formData.date}T${formData.time}`);
    const newReminder = {
      title: formData.title,
      start: startDate,
      end: new Date(startDate.getTime() + 60 * 60 * 1000), // default 1 hour
      priority: formData.priority,
    };

    const res = await axios.post("https://bimfrox-crm.onrender.com/api/reminders", newReminder);
    setReminders([
      ...reminders,
      { ...res.data, start: new Date(res.data.start), end: new Date(res.data.end) },
    ]);
    setFormData({ title: "", date: "", time: "", priority: "Normal" });
  };

  const deleteReminder = async (id) => {
    await axios.delete(`https://bimfrox-crm.onrender.com/api/reminders/${id}`);
    setReminders(reminders.filter((r) => r._id !== id));
  };

  // Handle drag & drop reschedule
  const moveReminder = async ({ event, start, end }) => {
    const updated = { ...event, start, end };
    await axios.put(`https://bimfrox-crm.onrender.com/api/reminders/${event._id}`, updated);
    setReminders(
      reminders.map((r) =>
        r._id === event._id ? { ...updated, start: new Date(start), end: new Date(end) } : r
      )
    );
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">Reminders (Calendar)</h2>

      {/* Add Reminder Form */}
      <form onSubmit={addReminder} className="mb-6 grid gap-3 max-w-lg">
        <input
          type="text"
          name="title"
          placeholder="Reminder title"
          value={formData.title}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <div className="flex gap-3">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="p-2 border rounded w-1/2"
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="p-2 border rounded w-1/2"
          />
        </div>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Reminder
        </button>
      </form>

      {/* Calendar with Drag & Drop */}
      <div className="h-[600px] bg-white rounded shadow p-3">
        <DnDCalendar
          localizer={localizer}
          events={reminders}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onEventDrop={moveReminder}
          resizable
          onEventResize={moveReminder}
          eventPropGetter={(event) => {
            let bg = "#9CA3AF"; // gray for Normal
            if (event.priority === "High") bg = "#EF4444"; // red
            if (event.priority === "Low") bg = "#10B981"; // green
            return { style: { backgroundColor: bg, color: "white" } };
          }}
          onSelectEvent={(event) => {
            if (window.confirm(`Delete reminder: ${event.title}?`)) {
              deleteReminder(event._id);
            }
          }}
        />
      </div>
    </div>
  );
}
