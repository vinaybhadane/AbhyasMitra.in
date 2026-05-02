import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AbhyasMitra',
  description: 'Read the privacy policy for AbhyasMitra – how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">Privacy Policy</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10">Last updated: May 2025</p>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2>1. Information We Collect</h2>
          <p>AbhyasMitra collects the following information when you use our platform:</p>
          <ul>
            <li><strong>Google Account Data:</strong> When you sign in with Google, we collect your name, email address, and profile photo.</li>
            <li><strong>Usage Data:</strong> We collect data about how you use the website (pages visited, time spent) via Google Analytics.</li>
            <li><strong>Comments:</strong> When you post a comment, we store your name, email, and comment content in Firebase Firestore.</li>
            <li><strong>Contact Form Data:</strong> When you submit the contact form, we store your name, email, and message.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide personalized features (comments, saved preferences).</li>
            <li>To analyze website traffic and improve our content.</li>
            <li>To respond to your inquiries submitted via the contact form.</li>
            <li>To display relevant advertisements via Google AdSense.</li>
          </ul>
        </section>

        <section>
          <h2>3. Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Authentication:</strong> Firebase Authentication uses cookies to maintain your login session.</li>
            <li><strong>Preferences:</strong> Your theme preference (dark/light) is saved in localStorage.</li>
            <li><strong>Analytics:</strong> Google Analytics uses cookies to track usage patterns.</li>
            <li><strong>Advertising:</strong> Google AdSense may use cookies to show relevant ads.</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Firebase (Google):</strong> Authentication, database, and storage.</li>
            <li><strong>Google Analytics:</strong> Website traffic analysis.</li>
            <li><strong>Google AdSense:</strong> Advertising.</li>
            <li><strong>Vercel:</strong> Website hosting.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>We use Firebase&apos;s built-in security rules to protect your data. Only authorized admins can write to the database. We do not sell your personal data to any third parties.</p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to request deletion of your data at any time by contacting us at vinaybhadane06@gmail.com. You can also sign out of your Google account to stop our data collection.</p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>For privacy-related questions, contact us at <a href="mailto:vinaybhadane06@gmail.com">vinaybhadane06@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
