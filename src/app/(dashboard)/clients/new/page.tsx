import NewClientClient from '@/ui/views/clients/new/NewClientClient';

export const revalidate = 0; // Dynamic server component

export default async function NewClientPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Add New Client</h1>
        <p className="text-slate-400 text-sm mt-1">
          Create a new client profile. Enforce strict checks for PAN, Mobile, DOB, and Aadhaar.
        </p>
      </div>

      <NewClientClient />
    </div>
  );
}
