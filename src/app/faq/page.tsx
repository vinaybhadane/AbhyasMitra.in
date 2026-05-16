import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronDown, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ – Frequently Asked Questions | AbhyasMitra',
  description: 'Answers to common questions about AbhyasMitra – SPPU 2024 Pattern notes, subjects covered, how to use the site, and more.',
  robots: { index: true, follow: true },
};

const faqs: { q: string; a: string }[] = [
  {
    q: 'What is AbhyasMitra?',
    a: 'AbhyasMitra is a free online study platform designed specifically for SPPU (Savitribai Phule Pune University) 2024 Pattern engineering students. We provide notes, solved problems, and study material for 1st Year and 2nd Year Computer Engineering subjects.',
  },
  {
    q: 'Is AbhyasMitra completely free?',
    a: 'Yes! All notes, study material, and solved problems on AbhyasMitra are 100% free. We keep the lights on through Google AdSense ads, so you never have to pay anything.',
  },
  {
    q: 'Which subjects are covered on AbhyasMitra?',
    a: 'We cover all major subjects for SPPU 2024 Pattern including: Engineering Mathematics 2, Engineering Physics, Engineering Chemistry, Engineering Mechanics, Engineering Graphics, Programming & Problem Solving (1st Year), and DBMS, Discrete Mathematics, Computer Organization & Microprocessor, IoT, Environmental Studies, Project Management, and Business Analytics (2nd Year CSE).',
  },
  {
    q: 'Is the content aligned with the SPPU 2024 syllabus?',
    a: 'Yes. All content on AbhyasMitra is specifically created and curated for the SPPU 2024 Pattern syllabus. We regularly update notes to match the latest syllabus revisions.',
  },
  {
    q: 'Can I access AbhyasMitra on my mobile phone?',
    a: 'Absolutely! AbhyasMitra is fully responsive and works seamlessly on smartphones, tablets, and desktops. You can study on the go without any app download.',
  },
  {
    q: 'How do I search for a specific topic or subject?',
    a: 'Use the Search bar (accessible from the navbar or by visiting /search). You can search by topic name, subject, or keywords and get instant results from all published notes.',
  },
  {
    q: 'Can I leave comments or ask questions on notes?',
    a: 'Yes! You can sign in with your Google account and leave comments on any post. Comments help create a community of students who can discuss topics and help each other.',
  },
  {
    q: 'Who writes the notes on AbhyasMitra?',
    a: 'Notes are written and reviewed by engineering students and contributors who have studied the respective subjects under the SPPU curriculum. All content goes through a review process before publishing.',
  },
  {
    q: 'How often is new content added?',
    a: 'We regularly publish new notes and study material. You can check the "Latest Notes" section on the homepage for recently published content.',
  },
  {
    q: 'I found an error in the notes. How do I report it?',
    a: 'We appreciate that! Please use the Contact page to report any errors or inaccuracies. Your feedback helps us maintain quality content for all students.',
  },
  {
    q: 'Why do I see ads on the website?',
    a: 'Ads (powered by Google AdSense) allow us to keep AbhyasMitra free for all students. Without ad revenue, we would not be able to maintain the servers and keep adding content. We try to keep ads non-intrusive.',
  },
  {
    q: 'Can I request notes for a specific topic?',
    a: 'Yes! Reach out to us via the Contact page with your topic request. We will try our best to cover it in an upcoming post.',
  },
];

// Schema.org FAQ structured data for rich results
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="page-enter min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 py-16 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-5">
              <HelpCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Everything you need to know about AbhyasMitra. Can&apos;t find your answer?{' '}
              <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-snug">
                      {q}
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 pt-1">
                  <div className="pl-9 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-indigo-100 dark:border-indigo-800 ml-3">
                    {a}
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center p-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
            <BookOpen className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              We&apos;re happy to help. Reach out through our contact page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors hover:border-indigo-300"
              >
                Search Notes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
