import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <PrivacyProvider>
      <div className="sdds-app-bg">
        <div className="sdds-app-frame">
          <div className="sdds-inner-frame">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </PrivacyProvider>
  );
}
