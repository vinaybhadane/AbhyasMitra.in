import { Metadata } from 'next';
import { SUBJECTS } from '@/lib/types';
import GridCard from '@/components/GridCard';
import WhatsAppCard from '@/components/WhatsAppCard';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllBrowseConfigs } from '@/lib/firestore';

const BRANCH_NAMES: Record<string, string> = {
  computer: 'Computer Engineering',
  it: 'Information Technology',
  'ai-ds': 'AI & Data Science',
  mechanical: 'Mechanical Engineering',
  electrical: 'Electrical Engineering',
  civil: 'Civil Engineering',
  entc: 'Electronics & Telecomm.',
};

const SEM_LABELS: Record<string, string> = {
  sem3: 'Semester 3',
  sem4: 'Semester 4',
  sem5: 'Semester 5',
  sem6: 'Semester 6',
  sem7: 'Semester 7',
  sem8: 'Semester 8',
};

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ branch: string; sem: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch, sem } = await params;
  const branchName = BRANCH_NAMES[branch] ?? branch;
  const semLabel = SEM_LABELS[sem] ?? sem;
  return {
    title: `${branchName} ${semLabel} – AbhyasMitra`,
    description: `Free notes and study material for ${semLabel} ${branchName} SPPU 2024 pattern.`,
  };
}

export default async function BranchSemPage({ params }: Props) {
  const { branch, sem } = await params;
  const branchName = BRANCH_NAMES[branch] ?? branch;
  const semLabel = SEM_LABELS[sem] ?? sem;

  // Dynamically filter subjects by matching the semester suffix
  const semString = sem.replace('sem', 'Sem '); // 'sem3' -> 'Sem 3'
  const subjects = SUBJECTS.filter((s) => 
    s.semester.toLowerCase().includes(semString.toLowerCase())
  );

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
              { label: branchName, href: `/browse/${branch}` },
              { label: semLabel },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
              {branchName} — {semLabel}
            </h1>
            <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
              {subjects.length > 0 ? 'SPPU 2024 Pattern subjects' : 'Select a subject to browse notes'}
            </p>
          </div>

          {subjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map((subject, i) => (
                <GridCard
                  key={subject.id}
                  title={subject.name}
                  href={`/subject/${subject.slug}`}
                  badge={subject.semester}
                  gradientIndex={i % 4}
                  bgImageUrl={configsMap.get(`${branch}/${sem}/${subject.slug}`)}
                />
              ))}
              <WhatsAppCard />
            </div>
          ) : (
            /* Empty state for branches/semesters not yet available */
            <div className="empty-state">
              <div className="empty-state__icon">📚</div>
              <h2 className="empty-state__title">Coming Soon</h2>
              <p className="empty-state__sub">
                Notes for {branchName} {semLabel} are being added. Check back soon, or join our WhatsApp community for updates!
              </p>
              <div className="mt-4">
                <WhatsAppCard />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
