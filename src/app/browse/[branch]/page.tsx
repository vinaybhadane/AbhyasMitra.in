import { Metadata } from 'next';
import GridCard from '@/components/GridCard';
import WhatsAppCard from '@/components/WhatsAppCard';
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

const YEARS = [
  { id: '2nd', label: '2nd Year', gradientIndex: 0 },
  { id: '3rd', label: '3rd Year', gradientIndex: 1 },
  { id: '4th', label: '4th Year', gradientIndex: 2 },
];

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ branch: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch } = await params;
  const name = BRANCH_NAMES[branch] ?? branch;
  return {
    title: `${name} – AbhyasMitra`,
    description: `Browse 2nd, 3rd and 4th year notes for ${name} under SPPU 2024 pattern.`,
  };
}

export default async function BranchPage({ params }: Props) {
  const { branch } = await params;
  const branchName = BRANCH_NAMES[branch] ?? branch;

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
              { label: branchName },
            ]}
          />

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--am-text-primary)' }}>
              {branchName}
            </h1>
            <p className="text-sm" style={{ color: 'var(--am-text-secondary)' }}>
              Select your year
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {YEARS.map((year) => (
              <GridCard
                key={year.id}
                title={year.label}
                href={`/browse/${branch}/${year.id}`}
                gradientIndex={year.gradientIndex}
                badge={year.label}
                bgImageUrl={configsMap.get(`${branch}/${year.id}`)}
              />
            ))}
            <WhatsAppCard />
          </div>
        </div>
      </section>
    </div>
  );
}
