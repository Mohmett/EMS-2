import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  HiOutlineClipboardList,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineSearch,
  HiPlus,
  HiOutlineBookmark,
  HiOutlineBadgeCheck,
  HiSave,
  HiX
} from 'react-icons/hi';
import supabase from '../lib/SupabaseClient';
import toast from 'react-hot-toast';

const ExamSubjects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [examSubjects, setExamSubjects] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Modal & form states for creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    examId: '',
    subjectId: '',
    maxMarks: '100'
  });

  // 1. Fetch Exam Subjects with relational data
  const fetchExamSubjects = async () => {
    const { data, error } = await supabase
      .from("exam_subjects")
      .select(`
        id,
        max_marks,
        exams ( id, name ),
        subjects ( id, name, code )
      `);

    if (error) {
      toast.error("Failed to fetch exam subjects");
      console.error(error);
      return;
    }

    setExamSubjects(data.map(item => ({
      id: item.id,
      maxMarks: item.max_marks,
      examName: item.exams?.name || "N/A",
      subjectName: item.subjects?.name || "N/A",
      subjectCode: item.subjects?.code || "N/A"
    })));
  };

  // Fetch dropdown data for the modal
  const fetchModalData = async () => {
    const { data: examData } = await supabase.from("exams").select("id, name");
    const { data: subjectData } = await supabase.from("subjects").select("id, name");
    setExams(examData || []);
    setSubjects(subjectData || []);
  };

  useEffect(() => {
    fetchExamSubjects();
    fetchModalData();
  }, []);

  // 2. Add New Exam Subject Mapping
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { error } = await supabase
        .from("exam_subjects")
        .insert([{
          exam_id: formData.examId,
          subject_id: formData.subjectId,
          max_marks: parseInt(formData.maxMarks)
        }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("This subject has already been added to the selected exam.");
        }
        throw error;
      }

      toast.success("Subject added to exam successfully!");
      setIsModalOpen(false);
      setFormData({ examId: '', subjectId: '', maxMarks: '100' });
      fetchExamSubjects();
    } catch (error) {
      toast.error(error.message || "Error adding subject mapping");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Delete Mapping Function
  const deleteExamSubject = async (id, subjectName) => {
    const { error } = await supabase
      .from("exam_subjects")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting mapping");
      console.error(error);
    } else {
      toast.success(`${subjectName} removed from exam successfully`);
      fetchExamSubjects();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Search Logic
  const filteredExamSubjects = examSubjects.filter(item =>
    item.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exam Subjects Mapping</h1>
              <p className="text-sm text-gray-500">Assign subjects and define maximum marks per exam.</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:scale-[1.02] active:scale-95"
          >
            <HiPlus size={20} />
            Assign Subject
          </button>
        </div>

        {/* 🔍 Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by exam or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 outline-none transition-all focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
            />
          </div>
        </div>

        {/* 📁 Exam Subjects Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-xl shadow-gray-200/40 border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Exam Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Subject</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Code</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Max Marks</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExamSubjects.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-bold text-gray-900">{item.examName}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{item.subjectName}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                        {item.subjectCode}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                      {item.maxMarks} pts
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Delete Button with Loading State */}
                        <button
                          onClick={async () => {
                            if (window.confirm(`Remove ${item.subjectName} from this exam?`)) {
                              setDeletingId(item.id);
                              await deleteExamSubject(item.id, item.subjectName);
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === item.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 border border-gray-100 disabled:cursor-not-allowed"
                          title="Remove Assignment"
                        >
                          {deletingId === item.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <HiOutlineTrash size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredExamSubjects.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                <HiOutlineClipboardList size={32} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No exam subjects mapped</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or link a subject to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* 📥 Quick Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Map Subject to Exam</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Select Exam */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Select Exam</label>
                <div className="relative">
                  <HiOutlineBookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    name="examId"
                    required
                    value={formData.examId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
                  >
                    <option value="">Select an exam...</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Select Subject</label>
                <div className="relative">
                  <HiOutlineBookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    name="subjectId"
                    required
                    value={formData.subjectId}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
                  >
                    <option value="">Select a subject...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Max Marks */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Max Marks</label>
                <div className="relative">
                  <HiOutlineBadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    name="maxMarks"
                    required
                    min="1"
                    value={formData.maxMarks}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-green-400 transition-all"
                >
                  {isCreating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <HiSave size={16} />
                  )}
                  Save Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSubjects;