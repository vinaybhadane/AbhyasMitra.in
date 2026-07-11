import { Metadata } from 'next';
import { SUBJECTS, getLucideIcon } from '@/lib/types';
import GridCard from '@/components/GridCard';
import WhatsAppCard from '@/components/WhatsAppCard';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllBrowseConfigs, getCustomSubjects } from '@/lib/firestore';

const SEM_LABELS: Record<string, string> = {
  sem1: 'Semester 1',
  sem2: 'Semester 2',
};

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ sem: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sem } = await params;
  const semLabel = SEM_LABELS[sem] ?? sem;
  const semNum = sem.replace('sem', '');
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://abhyasmitra.in'}/subjects/first-year/${sem}`;

  return {
    title: `SPPU FE First Year ${semLabel} Notes (2024 Pattern)`,
    description: `Get unit-wise study notes, solved question banks, and reference material for SPPU 2024 Pattern First Year (FE) Engineering ${semLabel} (Sem ${semNum}) subjects. Free PDF downloads.`,
    keywords: `sppu FE ${semLabel} notes, sppu first year ${semLabel} notes, sppu 2024 pattern engineering notes, sppu sem ${semNum} notes, engineering physics notes sppu, engineering mechanics notes sppu, engineering chemistry notes sppu, engineering mathematics notes sppu`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `SPPU FE First Year ${semLabel} Notes (2024 Pattern)`,
      description: `Structured unit-wise notes and solved papers for First Year Engineering (FE) ${semLabel} under SPPU 2024 pattern.`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function FirstYearSemPage({ params }: Props) {
  const { sem } = await params;
  const semLabel = SEM_LABELS[sem] ?? sem;

  // Fetch custom subjects for first year sem1 or sem2
  let customSubjects: any[] = [];
  try {
    const list = await getCustomSubjects();
    customSubjects = list
      .filter((s) => s.branch === 'first-year' && s.semester === sem)
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

  // Filter subjects by semester keyword
  const semString = sem.replace('sem', 'Sem '); // 'sem1' -> 'Sem 1'
  const staticFiltered = SUBJECTS.filter(
    (s) => s.year === '1st' && s.semester.toLowerCase().includes(semString.toLowerCase())
  );

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
              { label: '1st Year Engineering', href: '/subjects/first-year' },
              { label: semLabel },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
              1st Year Engineering — {semLabel}
            </h1>
            <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
              Select a subject to browse notes and study material
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
                bgImageUrl={configsMap.get(`first-year/${sem}/${subject.slug}`)}
              />
            ))}
            <WhatsAppCard />
          </div>
        </div>
      </section>
    </div>
  );
}
