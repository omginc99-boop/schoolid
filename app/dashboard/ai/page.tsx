import { requireSession } from '@/lib/auth';
import { modesForRole } from '@/lib/ai';
import AiWorkspace from '@/components/ai/AiWorkspace';
import { EmptyState } from '@/components/ui/primitives';
import { Sparkles } from 'lucide-react';

export const metadata = { title: 'AI Assistant' };

export default async function AiPage() {
  const ctx = await requireSession();
  const modes = modesForRole(ctx.profile.role).map(m => ({
    key: m.key, label: m.label, tagline: m.tagline, placeholder: m.placeholder,
  }));

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          AI built for your role — not a generic chatbot.
        </p>
      </div>
      {modes.length ? (
        <AiWorkspace modes={modes} />
      ) : (
        <div className="card">
          <EmptyState icon={Sparkles} message="No AI tools for this role yet" />
        </div>
      )}
    </div>
  );
}
