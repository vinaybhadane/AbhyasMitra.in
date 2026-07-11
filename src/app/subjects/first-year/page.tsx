import { Metadata } from 'next';
import GridCard from '@/components/GridCard';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllBrowseConfigs } from '@/lib/firestore';

export const metadata: Metadata = {
  title: '1st Year Engineering Semesters – AbhyasMitra',
  description: 'Select Sem 1 or Sem 2 for First Year Engineering subjects and study material under SPPU 2024 pattern.',
};

export const dynamic = 'force-dynamic';

const SEMESTERS = [
  { id: 'sem1', label: 'SEMESTER 1', badge: '1st Year - Sem 1', gradientIndex: 0 },
  { id: 'sem2', label: 'SEMESTER 2', badge: '1st Year - Sem 2', gradientIndex: 1 },
];

export default async function FirstYearPage() {
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
              SPPU 2024 Pattern — Select your semester
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SEMESTERS.map((sem) => (
              <GridCard
                key={sem.id}
                title={sem.label}
                href={`/subjects/first-year/${sem.id}`}
                badge={sem.badge}
                gradientIndex={sem.gradientIndex}
                bgImageUrl={configsMap.get(`first-year/${sem.id}`)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
