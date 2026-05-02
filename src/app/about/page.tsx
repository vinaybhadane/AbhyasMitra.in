import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Target, Users, Heart, Award, ArrowRight, GraduationCap, Laptop } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About AbhyasMitra – SPPU 2024 Pattern Study Platform',
  description:
    'AbhyasMitra is a free educational platform for SPPU 2024 pattern engineering students. Learn about our mission, team, and how we help students succeed.',
};

export default function AboutPage() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950/20 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AbhyasMitra
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            We are a group of engineering students and educators passionate about making quality study material 
            accessible to every SPPU student — completely free.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              AbhyasMitra was created to bridge the gap between students and quality study resources. 
              Many engineering students struggle to find organized, exam-focused notes for the SPPU 2024 pattern.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We provide well-structured notes, solved examples, and past paper solutions — all aligned with 
              the latest SPPU syllabus — so students can focus on understanding concepts rather than hunting for resources.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Target, label: 'SPPU Focused', desc: '2024 Pattern aligned content', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
              { icon: Users, label: '10K+ Students', desc: 'Helping students every month', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
              { icon: Heart, label: '100% Free', desc: 'No hidden fees or paywalls', color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
              { icon: Award, label: 'Quality Content', desc: 'Reviewed and verified notes', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Cover */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">What We Cover</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Comprehensive notes and study material for all major subjects in the SPPU engineering curriculum.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" /> First Year Engineering
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Engineering Mathematics 2</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Engineering Chemistry</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Engineering Physics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Engineering Mechanics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Engineering Graphics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Programming and Problem Solving</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600" /> Second Year Computer Engineering
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Database Management System</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Discrete Mathematics</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Computer Organization & Microprocessor</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Internet of Things</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Environmental Studies</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Project Management & Business Analytics (Electives)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Want to Contribute?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
            Are you an engineering student or educator who wants to share notes or contribute to the platform? 
            We&apos;d love to collaborate!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-2xl hover:bg-indigo-50 transition-colors"
          >
            Reach Out <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
