import { Metadata } from 'next';
import { SUBJECTS } from '@/lib/types';
import GridCard from '@/components/GridCard';
import WhatsAppCard from '@/components/WhatsAppCard';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllBrowseConfigs } from '@/lib/firestore';

export const metadata: Metadata = {
  title: '1st Year Engineering Subjects – AbhyasMitra',
  description: 'Free notes and study material for all First Year Engineering subjects under SPPU 2024 pattern.',
};

export const dynamic = 'force-dynamic';

export default async function FirstYearPage() {
  const subjects = SUBJECTS.filter((s) => s.year === '1st');

  // Load configs
  let configsMap = new Map<string, string>();
  try {
    const all = await getAllBrowseConfigs();
    all.forEach(c => {
      if (c.bgImageUrl) configsMap.set(c.id, c.bgImageUrl);
    });
  } catch {}

  return (
    <div style={{ background: 'var(--am-bg-page)', minHeight: '100vh' }}>
      <section className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            crumbs={[
              { label: 'Home', href: '/' },
              { label: '1st Year Engineering' },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
              1st Year Engineering
            </h1>
            <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
              SPPU 2024 Pattern — All branches
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject, i) => (
              <GridCard
                key={subject.id}
                title={subject.name}
                href={`/subject/${subject.slug}`}
                badge={subject.semester}
                gradientIndex={i % 4}
                bgImageUrl={configsMap.get(`first-year/${subject.slug}`)}
              />
            ))}
            <WhatsAppCard />
          </div>
        </div>
      </section>
    </div>
  );
}
