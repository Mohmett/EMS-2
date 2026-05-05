import React, { useEffect, useState } from 'react';
import { 
  HiOutlineClipboardCheck, 
  HiOutlineSearch, 
  HiPlus, 
  HiOutlineTrash, 
  HiX, 
  HiSave,
  HiOutlineUser,
  HiOutlineBookmark,
  HiOutlineBookOpen
} from 'react-icons/hi';
import supabase from '../lib/SupabaseClient';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Dropdown Data
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    exam_id: '',
    subject_id: '',
    marks_obtained: '',
    max_marks: 100,
    grade: '',
    remarks: ''
  });

  const fetchData = async () => {
    // 1. Fetch Results with joins
    const { data: res } = await supabase.from("results").select(`
      id, marks_obtained, max_marks, grade, remarks,
      students(name), exams(name), subjects(name)
    `);
    setResults(res || []);

    // 2. Fetch Dropdowns
    const { data: std } = await supabase.from("students").select("id, name");
    const { data: exm } = await supabase.from("exams").select("id, name");
    const { data: sbj } = await supabase.from("subjects").select("id, name");
    
    setStudents(std || []);
    setExams(exm || []);
    setSubjects(sbj || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("results").insert([formData]);
      if (error) throw error;
      
      toast.success("Result registered!");
      setIsModalOpen(false);
      setFormData({ student_id: '', exam_id: '', subject_id: '', marks_obtained: '', max_marks: 100, grade: '', remarks: '' });
      fetchData();
    } catch (err) {
      toast.error(err.code === '23505' ? "Result already exists!" : "Error saving result");
    } finally {
      setLoading(false);
    }
  };

  const deleteResult = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    setDeletingId(id);
    await supabase.from("results").delete().eq("id", id);
    setDeletingId(null);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HiOutlineClipboardCheck className="text-green-600" /> Results Hub
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-700 transition-all active:scale-95"
          >
            <HiPlus size={20} /> Register Result
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search student or exam..."
            className="w-full bg-gray-50 rounded-lg py-2 pl-12 pr-4 outline-none border border-transparent focus:border-green-600"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-600">Student</th>
                <th className="p-4 text-sm font-bold text-gray-600">Exam</th>
                <th className="p-4 text-sm font-bold text-gray-600">Subject</th>
                <th className="p-4 text-sm font-bold text-gray-600">Score</th>
                <th className="p-4 text-sm font-bold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.filter(r => r.students?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{res.students?.name}</td>
                  <td className="p-4">{res.exams?.name} </td>
                  <td className="p-4 font-mono font-bold text-green-600">{res.subjects?.name}</td>
                  <td className="p-4 font-mono font-bold text-green-600">{res.marks_obtained} / {res.max_marks}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteResult(res.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      {deletingId === res.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" /> : <HiOutlineTrash size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REGISTRATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Record New Result</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><HiX size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-600"
                    onChange={(e) => setFormData({...formData, student_id: e.target.value})}>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <HiOutlineBookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      onChange={(e) => setFormData({...formData, exam_id: e.target.value})}>
                      <option value="">Exam</option>
                      {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <HiOutlineBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                      onChange={(e) => setFormData({...formData, subject_id: e.target.value})}>
                      <option value="">Subject</option>
                      {subjects.map(sb => <option key={sb.id} value={sb.id}>{sb.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" required placeholder="Marks" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    onChange={(e) => setFormData({...formData, marks_obtained: e.target.value})} />
                  <input type="text" placeholder="Grade (Optional)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    onChange={(e) => setFormData({...formData, grade: e.target.value})} />
                </div>

                <textarea placeholder="Teacher remarks..." rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-green-600 py-3 font-bold text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2">
                  {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <HiSave />} Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;