'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Mail, Send, CheckCircle, MessageSquare, MapPin, Clock } from 'lucide-react';
import { submitContactMessage } from '@/lib/firestore';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Please enter a valid email';
    if (!form.message.trim() || form.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Have a question, suggestion, or want to contribute? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: 'Email Us',
                desc: 'vinaybhadane06@gmail.com',
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                icon: MessageSquare,
                title: 'Social Media',
                desc: 'Reach out on our social platforms for quick responses.',
                color: 'text-purple-600',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
              },
              {
                icon: Clock,
                title: 'Response Time',
                desc: 'We typically reply within 24-48 hours.',
                color: 'text-green-600',
                bg: 'bg-green-50 dark:bg-green-900/20',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`flex gap-4 p-5 ${bg} rounded-2xl border border-gray-100 dark:border-gray-700`}>
                <div className={`${color} mt-0.5`}><Icon className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Message Sent!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-6"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Vinay Bhadane"
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you need help with, a topic you'd like covered, or any feedback..."
                    rows={6}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors ${errors.message ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors w-full sm:w-auto justify-center"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
