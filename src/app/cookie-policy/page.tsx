import { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Shield, Settings, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy | AbhyasMitra',
  description: 'Learn how AbhyasMitra uses cookies to enhance your study experience, deliver ads, and analyze site traffic.',
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <div className="page-enter min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 py-16 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-5">
            <Cookie className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: May 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">

        {/* What are cookies */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What Are Cookies?</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Cookies are small text files that are placed on your device when you visit a website. They help websites
            remember information about your visit, making your next visit easier and the site more useful to you.
            Cookies do not give us access to your computer or any information beyond what you choose to share with us.
          </p>
        </section>

        {/* How we use cookies */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">How We Use Cookies</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
            AbhyasMitra uses cookies for the following purposes:
          </p>

          <div className="space-y-4">
            {[
              {
                title: 'Essential Cookies',
                badge: 'Always Active',
                badgeColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                desc: 'These cookies are necessary for the website to function correctly. They include authentication state (staying logged in), theme preference (dark/light mode), and session management.',
              },
              {
                title: 'Analytics Cookies (Google Analytics)',
                badge: 'Performance',
                badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                desc: 'We use Google Analytics (GA4) to understand how visitors interact with our site — which pages are popular, how long users stay, and where they come from. This data is anonymized and aggregated.',
              },
              {
                title: 'Advertising Cookies (Google AdSense)',
                badge: 'Advertising',
                badgeColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                desc: 'We display ads via Google AdSense to keep AbhyasMitra free for all students. AdSense uses cookies to serve ads based on your prior visits to our website or other websites. Google\'s use of advertising cookies enables it and its partners to serve ads based on your visit to our site.',
              },
              {
                title: 'Firebase (Authentication & Database)',
                badge: 'Functional',
                badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                desc: 'Firebase uses local storage and cookies to maintain your authentication session when you sign in to post comments.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Third Party */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Third-Party Cookies</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Some cookies on our site are set by third-party services. We have no direct control over these cookies.
            Please refer to the respective privacy policies for more information:
          </p>
          <ul className="mt-4 space-y-2">
            {[
              { name: 'Google Analytics', url: 'https://policies.google.com/privacy' },
              { name: 'Google AdSense', url: 'https://policies.google.com/technologies/ads' },
              { name: 'Firebase / Google', url: 'https://firebase.google.com/support/privacy' },
            ].map((item) => (
              <li key={item.name}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  {item.name} Privacy Policy →
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Manage cookies */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Managing Cookies</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>Delete existing cookies from your browser</li>
            <li>Set your browser to prevent cookies from being set</li>
            <li>Accept cookies on a case-by-case basis</li>
            <li>Opt out of Google advertising cookies at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">adssettings.google.com</a></li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4 text-sm">
            Please note that disabling certain cookies may affect the functionality of our website, including the ability to sign in or access personalized content.
          </p>
        </section>

        {/* Updates */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Changes to This Policy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in technology, law, or our services.
            We encourage you to review this page periodically. Continued use of the site after any changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Questions?</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            If you have any questions about our cookie usage, please reach out to us.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Contact Us
          </Link>
        </section>

        {/* Related links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/privacy-policy" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Terms & Conditions</Link>
          <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
