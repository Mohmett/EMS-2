import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  HiOutlineUserGroup,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineSearch,
  HiPlus,
  HiX,
  HiSave,
  HiOutlineUserAdd,
  HiIdentification
} from 'react-icons/hi';
import { MdOutlineSortByAlpha, MdOutlineEscalatorWarning } from 'react-icons/md';
import { PiStudentBold } from 'react-icons/pi';
import supabase from '../lib/SupabaseClient';
import toast from 'react-hot-toast';

const Students = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // --- Modal & Create States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [grades, setGrades] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    class_id: "",
    gender: "",
    date_of_birth: "",
    guardian_name: ""
  });

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select(`
          id, name, gender, date_of_birth, guardian_name, created_at,
          classes ( name )
        `);

    if (error) {
      toast.error("Failed to fetch students");
      return;
    }

    setStudents(data.map(s => ({
      id: s.id,
      name: s.name,
      gender: s.gender,
      dateOfBirth: s.date_of_birth,
      guardianName: s.guardian_name,
      created_at: s.created_at ? s.created_at.split('T')[0] : "",
      className: s.classes?.name || "Unassigned"
    })));
  };

  const fetchGrades = async () => {
    const { data } = await supabase.from("classes").select("*");
    if (data) setGrades(data);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.class_id || !formData.gender) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("students").insert([formData]);

    if (error) {
      toast.error(error.message || "Error creating student");
    } else {
      toast.success(`Successfully enrolled ${formData.name}`);
      setIsModalOpen(false);
      setFormData({ name: "", class_id: "", gender: "", date_of_birth: "", guardian_name: "" });
      fetchStudents();
    }
    setIsSaving(false);
  };

  const deleteStudent = async (id) => {
    try {
      await supabase.from("students").delete().eq("id", id);
      toast.success(`Student record removed`);
      fetchStudents();
    } catch (error) {
      console.log(error);
    }
  };

  // Logic for UI
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.className.localeCompare(b.className) 
      : b.className.localeCompare(a.className);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* 🌟 Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-sm">
              <HiOutlineUserGroup size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Students Directory</h1>
              <p className="text-sm text-gray-500">Manage and track student enrollments.</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
          >
            <HiPlus size={20} />
            Register Student
          </button>
        </div>

        {/* 🔍 Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
            />
          </div>

          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-green-600">
            <MdOutlineSortByAlpha size={20} /> Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        {/* 📁 Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Class</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Gender</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Guardian</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedStudents.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.className === 'Unassigned' ? 'bg-gray-100' : 'bg-green-50 text-green-700'}`}>
                        {s.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{s.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.guardianName}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/edit-student/${s.id}`)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600">
                          <HiOutlinePencilAlt size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete ${s.name}?`)) {
                              setDeletingId(s.id);
                              await deleteStudent(s.id);
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === s.id}
                          className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600"
                        >
                          {deletingId === s.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <HiOutlineTrash size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- 🛡️ REGISTRATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <HiOutlineUserAdd className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Student Enrollment</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><HiX size={24} /></button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <div className="relative">
                    <PiStudentBold className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" required placeholder="John Doe" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-green-600"
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Assigned Grade</label>
                  <div className="relative">
                    <MdOutlineEscalatorWarning className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select required className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-green-600"
                      value={formData.class_id} onChange={(e) => setFormData({...formData, class_id: e.target.value})}>
                      <option value="">Select Grade</option>
                      {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Gender</label>
                  <div className="relative">
                    <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select required className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-green-600"
                      value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                  <input type="date" required className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:border-green-600"
                    value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Guardian Name</label>
                  <input type="text" required placeholder="Parent or Legal Guardian" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:border-green-600"
                    value={formData.guardian_name} onChange={(e) => setFormData({...formData, guardian_name: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-green-600 py-3 font-bold text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 active:scale-95 disabled:bg-green-400">
                  {isSaving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <HiSave />}
                  {isSaving ? "Enrolling..." : "Complete Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;