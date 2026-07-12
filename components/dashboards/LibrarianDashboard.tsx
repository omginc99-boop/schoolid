import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/auth';
import { StatCard, PanelCard, EmptyState, StatusBadge } from '@/components/ui/primitives';
import { formatDate, formatMoney } from '@/lib/format';
import { Library, BookOpen, AlertTriangle, Wallet } from 'lucide-react';

export default async function LibrarianDashboard({ ctx }: { ctx: SessionContext }) {
  const supabase = await createClient();
  const sid = ctx.profile.school_id!;
  const currency = ctx.school?.currency ?? 'NGN';

  const [booksQ, loansQ] = await Promise.all([
    supabase.from('books')
      .select('id, title, author, category, shelf, copies_total, copies_available')
      .eq('school_id', sid).order('title').limit(50),
    supabase.from('book_loans')
      .select('id, borrowed_at, due_on, status, fine_amount, books(title), profiles!book_loans_borrower_profile_id_fkey(schoolid_number, people(full_name))')
      .eq('school_id', sid)
      .in('status', ['out', 'overdue'])
      .order('due_on').limit(30),
  ]);

  const books = booksQ.data ?? [];
  const loans = loansQ.data ?? [];
  const totalCopies = books.reduce((s, b) => s + b.copies_total, 0);
  const overdue = loans.filter(l => l.status === 'overdue');
  const fines = loans.reduce((s, l) => s + l.fine_amount, 0);
  const outOfStock = books.filter(b => b.copies_available === 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Catalogue and lending for {ctx.school?.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Titles" value={books.length} sub={`${totalCopies} copies`} icon={Library} />
        <StatCard label="Books out" value={loans.length} icon={BookOpen} />
        <StatCard label="Overdue" value={overdue.length} icon={AlertTriangle}
          tone={overdue.length > 0 ? 'bad' : 'ok'} />
        <StatCard label="Fines owed" value={formatMoney(fines, currency)} icon={Wallet}
          tone={fines > 0 ? 'warn' : 'ok'} />
      </div>

      <PanelCard title="Active loans">
        {loans.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Book</th><th>Borrower</th><th>Due</th><th>Fine</th><th>Status</th></tr></thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td className="font-medium max-w-[220px] truncate">{(l.books as { title?: string } | null)?.title}</td>
                    <td>
                      {(l.profiles as { people?: { full_name?: string } } | null)?.people?.full_name}
                      <span className="font-mono text-xs ml-2" style={{ color: 'var(--muted)' }}>
                        {(l.profiles as { schoolid_number?: string } | null)?.schoolid_number}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{formatDate(l.due_on)}</td>
                    <td>{l.fine_amount > 0 ? formatMoney(l.fine_amount, currency) : '—'}</td>
                    <td><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={BookOpen} message="No books out" hint="Loans will appear here when books are checked out." />
        )}
      </PanelCard>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard title="Catalogue" className="lg:col-span-2">
          {books.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Shelf</th><th>Available</th></tr></thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b.id}>
                      <td className="font-medium max-w-[220px] truncate">{b.title}</td>
                      <td style={{ color: 'var(--muted)' }}>{b.author}</td>
                      <td>{b.category}</td>
                      <td className="font-mono text-[13px]">{b.shelf}</td>
                      <td>
                        <span className={`badge ${b.copies_available === 0 ? 'badge-bad' : 'badge-ok'}`}>
                          {b.copies_available}/{b.copies_total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Library} message="Catalogue is empty" hint="Add your first books to start lending." />
          )}
        </PanelCard>

        <PanelCard title="Out of stock">
          {outOfStock.length ? (
            <ul className="space-y-2.5">
              {outOfStock.map(b => (
                <li key={b.id} className="p-3 rounded-xl text-sm font-medium" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                  {b.title}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Library} message="All titles in stock" />
          )}
        </PanelCard>
      </div>
    </div>
  );
}
