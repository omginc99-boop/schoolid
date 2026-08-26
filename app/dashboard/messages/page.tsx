import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import Messenger from '@/components/messages/Messenger';

export const metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const ctx = await requireSession();
  if (!ctx.profile.school_id) redirect('/dashboard');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Private conversations between teachers, parents and staff.
        </p>
      </div>
      <Messenger myProfileId={ctx.profile.id} schoolId={ctx.profile.school_id} />
    </div>
  );
}
