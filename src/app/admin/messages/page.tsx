'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, Check, AlertCircle } from 'lucide-react';
import { getContactMessages, deleteContactMessage, markMessageRead } from '@/lib/firestore';
import { ContactMessage } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await markMessageRead(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      } catch {}
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contact Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {messages.length} messages {unreadCount > 0 && <span className="text-orange-500 font-medium">({unreadCount} unread)</span>}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Message List */}
        <div className="lg:w-80 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto shrink-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
              <Mail className="w-10 h-10 mb-2 opacity-30" />
              No messages yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {messages.map((msg) => {
                const date = msg.createdAt instanceof Date ? msg.createdAt : (msg.createdAt as any)?.toDate?.();
                return (
                  <li key={msg.id}>
                    <button
                      onClick={() => handleView(msg)}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selected?.id === msg.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {!msg.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                          <span className={`text-sm ${!msg.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                            {msg.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{date ? formatDate(date) : ''}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{msg.message}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Message Detail */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          {selected ? (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">{selected.email}</a>
                </div>
                <button onClick={() => handleDelete(selected.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                <a
                  href={`mailto:${selected.email}?subject=Re: Your message to AbhyasMitra`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
