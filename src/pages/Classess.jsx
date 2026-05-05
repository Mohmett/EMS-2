import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  HiOutlineFolderOpen,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineSearch,
  HiPlus,
  HiX,
  HiSave,
  HiOutlineUserGroup
} from 'react-icons/hi';
import { SiGoogleclassroom } from 'react-icons/si';
import { MdOutlineClass } from 'react-icons/md';
import supabase from '../lib/SupabaseClient';
import toast from 'react-hot-toast';

const Classess = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  
  // --- Modal & Create States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [className, setClassName] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGrades();
    fetchTeachers();
  }, []);

  const fetchGrades = async () => {
    const { data, error } = await supabase
      .from("classes")
      .select("id, name, profiles!classes_teacher_id_fkey(username)");

    if (data) {
      setGrades(data.map(grade => ({
        id: grade.id,
        name: grade.name,
        formMaster: grade.profiles?.username || "N/A"
      })));
    }
  };

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("user_role", "teacher");
    if (data) setTeachers(data);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className.trim() || !selectedTeacherId) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("classes")
      .insert({
        name: className,
        section: "A",
        teacher_id: selectedTeacherId,
      });

    if (error) {
      toast.error("Error creating class");
      console.log(error.code);
      if(error.code === "42501"){
        toast.error("You don't have permission to create a class");
      }
    
    } else {
      toast.success("Class created successfully");
      setClassName("");
      setSelectedTeacherId("");
      setIsModalOpen(false); // Close Modal
      fetchGrades(); // Refresh List
    }
    setIsSaving(false);
  };

  const DeleteClass = async (id) => {
    try {
      await supabase.from("classes").delete().eq("id", id);
      toast.success(`Successfully deleted`);
      fetchGrades();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredGrades = grades.filter(grade =>
    grade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* 🌟 Header & Action Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <HiOutlineFolderOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Academic Grades</h1>
              <p className="text-sm text-gray-500">Manage student homeroom grades and allocations.</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)} // Open Modal Instead
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
          >
            <HiPlus size={18} />
            Add New Grade
          </button>
        </div>

        {/* 🔍 Search Bar */}
        <div className="relative max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by grade name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
          />
        </div>

        {/* 📁 Grades Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Grade ID</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Grade Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Form Master</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">#{grade.id.slice(0, 8)}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">{grade.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">{grade.formMaster}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/edit-grade/${grade.id}`)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all">
                          <HiOutlinePencilAlt size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete this class?`)) {
                              setDeletingId(grade.id);
                              await DeleteClass(grade.id);
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === grade.id}
                          className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed transition-all"
                        >
                          {deletingId === grade.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <HiOutlineTrash size={18} />}
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

      {/* --- 🛡️ CREATE CLASS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <MdOutlineClass className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Class Register</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <HiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Class Name</label>
                  <div className="relative">
                    <SiGoogleclassroom className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="e.g. Senior Year B"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Teacher</label>
                  <div className="relative">
                    <HiOutlineUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-green-600 transition-all"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.username}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-2 bg-green-600 py-3 px-8 font-bold text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-green-400">
                  {isSaving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <HiSave />} 
                  {isSaving ? "Saving..." : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classess;