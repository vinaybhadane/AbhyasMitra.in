import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | AbhyasMitra',
  description: 'Read the terms and conditions for using AbhyasMitra – the free SPPU engineering study platform.',
};

export default function TermsPage() {
  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">Terms and Conditions</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10">Last updated: May 2025</p>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing AbhyasMitra (abhyasmitra.com), you agree to these terms. If you do not agree, please do not use our website.</p>
        </section>

        <section>
          <h2>2. Educational Content</h2>
          <p>All study materials, notes, and solutions on AbhyasMitra are provided for educational purposes only. While we strive for accuracy, we do not guarantee that all content is error-free. Always verify information with official SPPU resources.</p>
        </section>

        <section>
          <h2>3. Intellectual Property</h2>
          <p>The content on AbhyasMitra, including blog posts, graphics, and design, is the intellectual property of AbhyasMitra unless otherwise stated. You may not reproduce, distribute, or sell our content without explicit written permission.</p>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>By using our comment system, you agree to:</p>
          <ul>
            <li>Post only relevant, respectful comments.</li>
            <li>Not post spam, abusive, or offensive content.</li>
            <li>Not impersonate others or provide false information.</li>
            <li>Not use our platform for any illegal activities.</li>
          </ul>
          <p>We reserve the right to delete any comments that violate these rules.</p>
        </section>

        <section>
          <h2>5. Advertising</h2>
          <p>AbhyasMitra may display advertisements via Google AdSense. We are not responsible for the content of third-party advertisements.</p>
        </section>

        <section>
          <h2>6. Disclaimer</h2>
          <p>AbhyasMitra is an independent educational platform and is not officially affiliated with Savitribai Phule Pune University (SPPU). SPPU is the official authority for examination patterns and syllabus.</p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>AbhyasMitra shall not be liable for any damages resulting from the use or inability to use our services, including exam results, academic performance, or data loss.</p>
        </section>

        <section>
          <h2>8. Changes to Terms</h2>
          <p>We reserve the right to update these terms at any time. Continued use of the website constitutes acceptance of the revised terms.</p>
        </section>

        <section>
          <h2>9. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:vinaybhadane06@gmail.com">vinaybhadane06@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
