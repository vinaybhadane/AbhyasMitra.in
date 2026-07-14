import { Metadata } from 'next';
import { SUBJECTS, getLucideIcon } from '@/lib/types';
import GridCard from '@/components/GridCard';
import WhatsAppCard from '@/components/WhatsAppCard';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllBrowseConfigs, getCustomSubjects } from '@/lib/firestore';

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

export const revalidate = 3600;

interface Props {
  params: Promise<{ branch: string; sem: string }>;
}

const SEM_YEARS: Record<string, string> = {
  sem3: 'SE', sem4: 'SE', sem5: 'TE', sem6: 'TE', sem7: 'BE', sem8: 'BE'
};

const SEM_YEAR_FULL: Record<string, string> = {
  sem3: 'Second Year', sem4: 'Second Year', sem5: 'Third Year', sem6: 'Third Year', sem7: 'Fourth Year', sem8: 'Fourth Year'
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch, sem } = await params;
  const branchName = BRANCH_NAMES[branch] ?? branch;
  const semLabel = SEM_LABELS[sem] ?? sem;
  const semNum = sem.replace('sem', '');
  const yearAbbr = SEM_YEARS[sem] || 'SE/TE/BE';
  const yearFull = SEM_YEAR_FULL[sem] || 'Engineering';
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in'}/browse/${branch}/${sem}`;

  return {
    title: `SPPU ${yearAbbr} ${branchName} ${semLabel} Notes (2024 Pattern)`,
    description: `Get latest unit-wise structured notes, solved numericals, syllabus, and study material for SPPU 2024 Pattern ${yearFull} ${branchName} (${semLabel}). Download free PDF resources.`,
    keywords: `sppu ${branch} notes, ${yearAbbr} ${branchName} sem ${semNum} notes, sppu 2024 pattern ${branch} notes, ${branchName} engineering sppu notes, sppu ${semLabel} engineering notes, ${yearFull} ${branchName} study material, sppu notes pdf download`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `SPPU ${yearAbbr} ${branchName} ${semLabel} Notes (2024 Pattern)`,
      description: `Free PDF study notes, syllabus, and solved papers for SPPU 2024 Pattern ${yearFull} ${branchName} (${semLabel}).`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function BranchSemPage({ params }: Props) {
  const { branch, sem } = await params;
  const branchName = BRANCH_NAMES[branch] ?? branch;
  const semLabel = SEM_LABELS[sem] ?? sem;

  // Fetch custom subjects
  let customSubjects: any[] = [];
  try {
    const list = await getCustomSubjects();
    customSubjects = list
      .filter((s) => s.branch === branch && s.semester === sem)
      .map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        year: s.year,
        semester: s.semesterLabel,
        description: s.description,
        icon: getLucideIcon(s.iconName),
        color: s.color,
        iconColor: s.iconColor,
      }));
  } catch (e) {
    console.error('Failed to load custom subjects', e);
  }

  // Dynamically filter subjects by matching the semester suffix
  const semString = sem.replace('sem', 'Sem '); // 'sem3' -> 'Sem 3'
  const isComputerBranch = branch === 'computer';
  const staticFiltered = SUBJECTS.filter((s) => {
    const isSemMatch = s.semester.toLowerCase().includes(semString.toLowerCase());
    if (s.year === '2nd') {
      return isSemMatch && isComputerBranch;
    }
    return isSemMatch;
  });

  const subjects = [...staticFiltered, ...customSubjects];

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
