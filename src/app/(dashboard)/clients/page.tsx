import { createClient } from '@/utils/supabase/server';
import ClientListContainer from './ClientListContainer';

export const revalidate = 0; // Disable caching to fetch updated data

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id, name, pan, mobile, email, dob, family_group,
      filings(
        acknowledgement_number,
        invoices(invoice_number)
      )
    `)
    .order('name');

  if (error) {
    console.error('Failed to fetch clients:', error);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Management</h1>
        <p className="text-slate-400 text-sm mt-1">Manage client profiles, contact numbers, and login credentials.</p>
      </div>

      <ClientListContainer initialClients={clients || []} />
    </div>
  );
}
