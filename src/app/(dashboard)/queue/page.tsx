import { createClient } from '@/utils/supabase/server';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import QueueListContainer from '@/ui/views/queue/QueueListContainer';

export const revalidate = 0; // Dynamic server rendering

interface QueuePageProps {
  searchParams: Promise<{ ay?: string }>;
}

export default async function QueuePage({ searchParams }: QueuePageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedAY = resolvedSearchParams.ay || getCurrentAssessmentYear();
  const ayList = getAssessmentYears();
  const supabase = await createClient();

  // Fetch all filings for selected AY
  const { data: queue, error } = await supabase
    .from('filings')
    .select('*, clients!inner(name, pan, mobile, email, dob, is_excluded_from_queue)')
    .eq('assessment_year', selectedAY)
    .eq('clients.is_excluded_from_queue', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load queue:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Filing Work Queue</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor clients in active filing statuses, trigger AY rollovers, and send follow-ups.
        </p>
      </div>

      <QueueListContainer 
        initialQueue={(queue as any[]) || []} 
        selectedAY={selectedAY} 
        ayList={ayList} 
      />
    </div>
  );
}
