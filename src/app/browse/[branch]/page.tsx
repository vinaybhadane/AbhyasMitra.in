import { Metadata } from 'next';
import SemesterGrid from '@/components/SemesterGrid';
import Breadcrumb from '@/components/Breadcrumb';
import { getAllBrowseConfigs } from '@/lib/firestore';

// Map branch slugs to display names
const BRANCH_NAMES: Record<string, string> = {
  computer: 'Computer Engineering',
  it: 'Information Technology',
  'ai-ds': 'AI & Data Science',
  mechanical: 'Mechanical Engineering',
  electrical: 'Electrical Engineering',
  civil: 'Civil Engineering',
  entc: 'Electronics & Telecomm.',
};

const SEMESTERS = [
  { id: 'sem3', label: 'SEMESTER 3', badge: '2nd Year - Sem 1', gradientIndex: 0 },
  { id: 'sem4', label: 'SEMESTER 4', badge: '2nd Year - Sem 2', gradientIndex: 1 },
  { id: 'sem5', label: 'SEMESTER 5', badge: '3rd Year - Sem 1', gradientIndex: 2 },
  { id: 'sem6', label: 'SEMESTER 6', badge: '3rd Year - Sem 2', gradientIndex: 3 },
  { id: 'sem7', label: 'SEMESTER 7', badge: '4th Year - Sem 1', locked: true, gradientIndex: 0 },
  { id: 'sem8', label: 'SEMESTER 8', badge: '4th Year - Sem 2', locked: true, gradientIndex: 1 },
];

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ branch: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch } = await params;
  const name = BRANCH_NAMES[branch] ?? branch;
  return {
    title: `${name} Semesters – AbhyasMitra`,
    description: `Browse semesters 3 to 8 engineering notes and study material for ${name} under SPPU 2024 pattern.`,
  };
}

export default async function BranchPage({ params }: Props) {
  const { branch } = await params;
  const branchName = BRANCH_NAMES[branch] ?? branch;

  // Load configs
  let configsMapObj: Record<string, string> = {};
  try {
    const all = await getAllBrowseConfigs();
    all.forEach(c => {
      if (c.bgImageUrl) configsMapObj[c.id] = c.bgImageUrl;
    });
  } catch {}

  return (
    <div style={{ background: 'var(--am-bg-page)', minHeight: '100vh' }}>
      <section className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            crumbs={[
              { label: 'Home', href: '/' },
              { label: branchName },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
              {branchName}
            </h1>
            <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
              Select your semester
            </p>
          </div>

          <SemesterGrid branch={branch} semesters={SEMESTERS} configsMap={configsMapObj} />
        </div>
      </section>
    </div>
  );
}
