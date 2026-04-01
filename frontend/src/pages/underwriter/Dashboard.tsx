import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { User, ShieldAlert, CheckCircle2, Search, MessageSquare, FileText, Send } from 'lucide-react';

export const Dashboard = () => {
   const [pending, setPending] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedDep, setSelectedDep] = useState<any>(null);
   const [decision, setDecision] = useState({
      loading_amount: 0,
      underwriter_notes: '',
      status: 'AWAITING_PAYMENT' as 'AWAITING_PAYMENT' | 'REJECTED'
   });
   const [timeline, setTimeline] = useState<any[]>([]);
   const chatEndRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      fetchPending();
   }, []);

   const fetchPending = async () => {
      try {
         const token = localStorage.getItem('token');
         const res = await axios.get('/api/underwriting/pending', {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         setPending(res.data);
      } catch (err) {
         console.error('Failed to fetch pending cases', err);
      } finally {
         setLoading(false);
      }
   };

   const fetchTimeline = async (dep: any) => {
      try {
         const token = localStorage.getItem('token');
         const res = await axios.get(`/api/underwriting/timeline/DEPENDENT/${dep.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         setTimeline(res.data);
      } catch (err) {
         setTimeline([]);
      }
   };

   useEffect(() => {
      if (chatEndRef.current) {
         chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
   }, [timeline]);

   const handleDecision = async () => {
      if (!selectedDep) return;
      try {
         const token = localStorage.getItem('token');
         await axios.post(`/api/underwriting/decide/${selectedDep.id}`, decision, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         setSelectedDep(null);
         fetchPending();
      } catch (err) {
         alert('Failed to submit decision');
      }
   };

   const handleSendQuery = async () => {
      if (!selectedDep || !decision.underwriter_notes) return;
      try {
         const token = localStorage.getItem('token');
         await axios.post('/api/underwriting/communication', {
            entity_id: selectedDep.id,
            entity_type: 'DEPENDENT',
            message: decision.underwriter_notes
         }, { headers: { Authorization: `Bearer ${token}` } });

         setDecision({ ...decision, underwriter_notes: '' });
         fetchTimeline(selectedDep);
      } catch (err) {
         alert('Failed to send query');
      }
   };

   if (loading) return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Risk Engine...</p>
         </div>
      </div>
   );

   return (
      <div className="min-h-screen bg-[#FDFDFF] p-8">
         <div className="max-w-7xl mx-auto space-y-10">

            <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight lh-1">Underwriting <span className="text-indigo-600">Ops</span></h1>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Risk Assessment & Medical Review Queue</p>
               </div>
               <div className="flex gap-4">
                  <div className="h-20 w-48 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col justify-center px-8 border-b-4 border-b-indigo-500/20">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Queue</span>
                     <span className="text-2xl font-black text-indigo-600 tracking-tighter">{pending.length} <span className="text-slate-300 text-xs font-bold font-mono">Cases</span></span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
               {/* Member Queue */}
               <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide">
                  <div className="relative group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
                     <input
                        type="text"
                        placeholder="Filter by name..."
                        className="w-full h-16 bg-white border border-slate-100 rounded-3xl pl-16 pr-8 text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all shadow-sm"
                     />
                  </div>

                  {pending.length === 0 ? (
                     <div className="h-64 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <CheckCircle2 className="h-10 w-10 text-slate-200" />
                        <p className="text-xs font-black uppercase tracking-widest">Queue Clear</p>
                     </div>
                  ) : (
                     pending.map((dep: any) => (
                        <button
                           key={dep.id}
                           onClick={() => {
                              setSelectedDep(dep);
                              fetchTimeline(dep);
                              setDecision({
                                 loading_amount: dep.loading_amount,
                                 underwriter_notes: dep.underwriter_notes || '',
                                 status: 'AWAITING_PAYMENT'
                              });
                           }}
                           className={`group w-full bg-white p-8 rounded-[2.5rem] border transition-all text-left relative overflow-hidden ${selectedDep?.id === dep.id ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-[1.02]' : 'border-slate-100 hover:border-indigo-200 shadow-sm'}`}
                        >
                           <div className="flex justify-between items-start mb-6">
                              <span className={`px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest ${selectedDep?.id === dep.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
                                 {dep.relationship}
                              </span>
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                 {new Date().getFullYear() - new Date(dep.dob).getFullYear()} YRS
                              </span>
                           </div>
                           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{dep.name}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {dep.member.name}</p>
                        </button>
                     ))
                  )}
               </div>

               {/* Redesigned Dual-Column Review Panel */}
               <div className="col-span-12 lg:col-span-9">
                  {selectedDep ? (
                     <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-full flex flex-col overflow-hidden relative">

                        {/* Global Panel Header */}
                        <div className="p-10 border-b border-slate-50 bg-slate-50/50">
                           <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedDep.name}</h2>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ref: {selectedDep.member.name} • {selectedDep.relationship}</p>
                              </div>
                              <div className="h-20 w-40 bg-indigo-600 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-600/20 border-b-4 border-white/20">
                                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Base Premium</span>
                                 <span className="text-2xl font-black tracking-tighter">₹{selectedDep.base_premium.toLocaleString()}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                           {/* Left Column: Risk Assessment (40%) */}
                           <div className="w-[40%] overflow-y-auto p-12 border-r border-slate-50 space-y-12 scrollbar-hide">
                              <section className="space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Health Risk Profile</h4>
                                 <div className="p-8 bg-red-50/50 rounded-[2.5rem] border border-red-100/50 space-y-5">
                                    <div className="flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                       <ShieldAlert className="h-5 w-5" />
                                       Critical Medical History
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-l-4 border-red-200 pl-6 py-1">
                                       "{selectedDep.medical_conditions || 'Manual Review Required'}"
                                    </p>
                                 </div>
                              </section>

                              <section className="space-y-10">
                                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Decision Console</h4>
                                 <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Risk Loading (₹)</label>
                                    <div className="relative">
                                       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-2xl">₹</div>
                                       <input
                                          type="number"
                                          value={decision.loading_amount}
                                          onChange={(e) => setDecision({ ...decision, loading_amount: Number(e.target.value) })}
                                          className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-8 text-4xl font-black text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                       />
                                    </div>
                                 </div>
                                 <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status Override Decision</label>
                                    <div className="flex gap-4 h-24">
                                       <button
                                          onClick={() => setDecision({ ...decision, status: 'AWAITING_PAYMENT' })}
                                          className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest border transition-all ${decision.status === 'AWAITING_PAYMENT' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-600/20' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                                       >
                                          <CheckCircle2 className="h-5 w-5" />
                                          Approve
                                       </button>
                                       <button
                                          onClick={() => setDecision({ ...decision, status: 'REJECTED' })}
                                          className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-[2.5rem] font-black uppercase text-[11px] tracking-widest border transition-all ${decision.status === 'REJECTED' ? 'bg-red-600 text-white border-red-600 shadow-2xl shadow-red-600/20' : 'bg-white text-slate-400 border-slate-100 hover:border-red-200'}`}
                                       >
                                          <ShieldAlert className="h-5 w-5" />
                                          Reject
                                       </button>
                                    </div>
                                 </div>
                              </section>
                           </div>

                           {/* Right Column: Chat Hub (60%) */}
                           <div className="w-[60%] flex flex-col bg-slate-50/30">
                              <div className="p-8 border-b border-slate-100 bg-white">
                                 <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Communication Hub</h4>
                              </div>
                              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                                 {timeline.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                                       <MessageSquare className="h-12 w-12" />
                                       <p className="text-[10px] font-black uppercase tracking-widest">No conversation history</p>
                                    </div>
                                 ) : (
                                    timeline.map((note) => (
                                       <div key={note.id} className={`flex flex-col ${note.from_role === 'MEMBER' ? 'items-start' : 'items-end'}`}>
                                          <div className={`max-w-[90%] p-5 rounded-[1.5rem] text-sm shadow-sm border ${note.from_role === 'MEMBER'
                                                ? 'bg-white border-slate-100 rounded-bl-none'
                                                : 'bg-indigo-600 text-white border-indigo-600 rounded-br-none'
                                             }`}>
                                             <div className="flex justify-between items-center gap-4 mb-2">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${note.from_role === 'MEMBER' ? 'text-indigo-600' : 'text-indigo-100'}`}>
                                                   {note.from_role}
                                                </span>
                                                <span className={`text-[8px] font-bold ${note.from_role === 'MEMBER' ? 'text-slate-300' : 'text-indigo-200'}`}>
                                                   {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                             </div>
                                             <p className="font-bold leading-relaxed">{note.message}</p>
                                             {note.attachment_url && (
                                                <a href={note.attachment_url} target="_blank" className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${note.from_role === 'MEMBER' ? 'bg-indigo-50 text-indigo-600' : 'bg-white/10 text-white'
                                                   }`}>
                                                   <FileText className="h-4 w-4" />
                                                   View Document
                                                </a>
                                             )}
                                          </div>
                                       </div>
                                    ))
                                 )}
                                 <div ref={chatEndRef} />
                              </div>
                              <div className="p-8 bg-white border-t border-slate-100">
                                 <div className="relative">
                                    <textarea
                                       value={decision.underwriter_notes}
                                       onChange={(e) => setDecision({ ...decision, underwriter_notes: e.target.value })}
                                       className="w-full h-32 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-bold text-slate-600 focus:outline-none"
                                       placeholder="Type a message to member..."
                                    />
                                    <button
                                       onClick={handleSendQuery}
                                       disabled={!decision.underwriter_notes}
                                       className="absolute right-4 bottom-4 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                       <Send className="h-5 w-5" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="p-10 bg-slate-900 flex items-center justify-between gap-10">
                           <div className="flex items-center gap-10">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest opacity-60">Base</p>
                                 <p className="text-2xl font-black text-slate-400">₹{selectedDep.base_premium.toLocaleString()}</p>
                              </div>
                              <div className="h-10 w-[1px] bg-slate-700"></div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest opacity-60">Loading</p>
                                 <p className="text-2xl font-black text-red-400">+₹{decision.loading_amount.toLocaleString()}</p>
                              </div>
                              <div className="h-10 w-[1px] bg-slate-700"></div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest opacity-60">Authorized Premium</p>
                                 <p className="text-4xl font-black text-white tracking-tighter">₹{(selectedDep.base_premium + decision.loading_amount).toLocaleString()}</p>
                              </div>
                           </div>
                           <button
                              onClick={handleDecision}
                              className="px-16 py-8 bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl hover:bg-indigo-400 transition-all active:scale-95 shadow-2xl shadow-indigo-500/40"
                           >
                              Authorize Assessment
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="h-full bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-8">
                        <User className="h-20 w-20 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">Select a case to begin review</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};
