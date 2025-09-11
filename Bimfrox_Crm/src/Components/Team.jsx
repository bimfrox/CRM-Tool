import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://bimfrox-crm.onrender.com/api/teammember";

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    image: "",
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTeam(res.data);
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL, formData);
      setTeam([...team, res.data]);
      setFormData({ name: "", role: "", email: "", phone: "", image: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Error adding member:", err.response?.data || err);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-4xl font-extrabold text-green-800 drop-shadow-md mb-3 sm:mb-0">
          👥 Our Awesome Team
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transform transition"
        >
          + Add Member
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-14 h-14 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center transition transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 mb-4 shadow-inner">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h2>
              <p className="text-green-700 font-medium mb-1">{member.role}</p>
              <p className="text-gray-500 text-sm mb-1">{member.email}</p>
              <p className="text-gray-700 text-sm mb-3">📞 {member.phone}</p>
              
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl w-96 p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
              ➕ Add Team Member
            </h2>
            <form onSubmit={addMember} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-xl"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover mt-2 mx-auto border-2 border-green-500"
                />
              )}
              <div className="flex justify-end space-x-3 mt-4">
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
