import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, FileText, User, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

interface UnderwritingTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'MEMBER' | 'DEPENDENT';
  entityName: string;
}

export const UnderwritingTimelineModal = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  entityName
}: UnderwritingTimelineModalProps) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchTimeline = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/underwriting/timeline/${entityType}/${entityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch timeline', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTimeline();
    }
  }, [isOpen, entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !file) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('entity_id', entityId);
      data.append('entity_type', entityType);
      data.append('message', message);
      if (file) data.append('file', file);

      await axios.post('/api/underwriting/communication', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('');
      setFile(null);
      fetchTimeline();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed !mt-0 inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Underwriting Review</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing: {entityName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Timeline body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white scrollbar-hide">
          {fetching ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300">
              <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-widest">Gathering History...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300 p-12 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                <Clock className="h-6 w-6 opacity-40" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Analysis Initiated</p>
                <p className="text-[10px] font-medium text-slate-400 mt-2 max-w-[200px]">The underwriting team is currently reviewing the medical declaration provided during enrollment.</p>
              </div>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className={`flex gap-4 ${note.from_role === 'MEMBER' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center ${note.from_role === 'MEMBER' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                  {note.from_role === 'MEMBER' ? <User className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                <div className={`flex flex-col max-w-[80%] ${note.from_role === 'MEMBER' ? 'items-end' : ''}`}>
                  <div className={`p-5 rounded-[1.5rem] border ${note.from_role === 'MEMBER'
                    ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-lg shadow-indigo-100'
                    : 'bg-white text-slate-700 border-slate-100 rounded-tl-none shadow-sm shadow-slate-100'
                    }`}>
                    <p className="text-sm font-medium leading-relaxed">{note.message}</p>
                    {note.attachment_url && (
                      <a
                        href={note.attachment_url}
                        target="_blank"
                        className={`mt-3 flex items-center gap-2 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${note.from_role === 'MEMBER' ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                          }`}
                      >
                        <FileText className="h-3 w-3" />
                        View Document
                      </a>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 px-1">
                    {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-slate-50 bg-slate-50/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message or provide details..."
                className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 pr-20 text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none resize-none h-24"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                  />
                  <button type="button" className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${file ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                    }`}>
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || (!message && !file)}
                  className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
            {file && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-100 animate-in slide-in-from-bottom-2">
                <span className="flex-1 truncate">{file.name} ready for upload</span>
                <button type="button" onClick={() => setFile(null)}>✕</button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};
