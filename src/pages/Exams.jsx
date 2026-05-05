import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  HiOutlineClipboardList,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineSearch,
  HiPlus,
  HiOutlineCalendar,
  HiOutlineBookmark,
  HiX,
  HiSave
} from 'react-icons/hi';
import supabase from '../lib/SupabaseClient';
import toast from 'react-hot-toast';

const Exams = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [exams, setExams] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    examDate: '',
    academicYear: '',
    term: '',
  });

  const fetchExams = async () => {
    const { data, error } = await supabase.from("exams").select("*");
    if (error) {
      toast.error("Failed to fetch exams");
    } else {
      setExams(data.map(exam => ({
        id: exam.id,
        name: exam.name,
        date: exam.exam_date,
        academic_year: exam.academic_year,
        term: exam.term
      })));
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('exams')
        .insert({
          name: formData.name,
          exam_date: formData.examDate,
          academic_year: formData.academicYear,
          term: formData.term
        });

      if (error) throw error;

      toast.success('Exam scheduled successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', examDate: '', academicYear: '', term: '' });
      fetchExams(); // Refresh table
    } catch (error) {
      toast.error('Failed to create exam.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExam = async (id, name) => {
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting exam");
    } else {
      toast.success(`${name} deleted successfully`);
      fetchExams();
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.academic_year?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.term?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* 🌟 Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-sm">
              <HiOutlineClipboardList size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exams List</h1>
              <p className="text-sm text-gray-500">Manage scheduled assessments and academic terms.</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
          >
            <HiPlus size={20} />
            Schedule Exam
          </button>
        </div>

        {/* 🔍 Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, year, or term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 outline-none focus:border-green-600 transition-all"
            />
          </div>
        </div>

        {/* 📁 Exams Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Exam Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Academic Year</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Term</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <HiOutlineBookmark className="text-green-600" />
                        {exam.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar size={16} />
                        {exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{exam.academic_year}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {exam.term}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/edit-exam/${exam.id}`)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-green-50 transition-all">
                          <HiOutlinePencilAlt size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete ${exam.name}?`)) {
                              setDeletingId(exam.id);
                              await deleteExam(exam.id, exam.name);
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === exam.id}
                          className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 transition-all disabled:cursor-not-allowed"
                        >
                          {deletingId === exam.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <HiOutlineTrash size={18} />}
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

      {/* --- 📅 CREATE EXAM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <HiOutlineClipboardList className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Schedule New Exam</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><HiX size={24} /></button>
            </div>

            <form onSubmit={handleCreateExam} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Exam Name</label>
                  <div className="relative">
                    <HiOutlineBookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Mid-Term Assessment"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none focus:border-green-600 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Exam Date</label>
                  <div className="relative">
                    <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none focus:border-green-600 transition-all"
                      value={formData.examDate}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Academic Year</label>
                    <input 
                      type="text" 
                      required
                      placeholder="2025-2026"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:border-green-600 transition-all"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Term</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Term 1"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 outline-none focus:border-green-600 transition-all"
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-green-600 py-3 font-bold text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-green-400">
                  {isSaving ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <HiSave />}
                  {isSaving ? "Saving..." : "Save Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;