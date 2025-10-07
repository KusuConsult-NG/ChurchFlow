import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function Page() {
  const items = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { book: true }
  });
  return (
    <main>
      <h2 className='text-2xl font-bold'>Transactions</h2>
      <form
        action='/api/transaction'
        method='post'
        className='grid gap-2 max-w-xl mt-2'
      >
        <input
          name='bookId'
          placeholder='Account (book) ID'
          className='h-10 px-3 rounded-lg border border-black/15'
        />
        <select
          name='type'
          className='h-10 px-3 rounded-lg border border-black/15'
        >
          <option value='CREDIT'>CREDIT</option>
          <option value='DEBIT'>DEBIT</option>
        </select>
        <input
          name='amount'
          type='number'
          defaultValue='0'
          placeholder='Amount'
          className='h-10 px-3 rounded-lg border border-black/15'
        />
        <input
          name='note'
          placeholder='Note'
          className='h-10 px-3 rounded-lg border border-black/15'
        />
        <button
          className='inline-flex items-center h-10 px-4 rounded-lg bg-black text-white'
          type='submit'
        >
          Create
        </button>
      </form>
      <ul className='mt-3'>
        {items.map(x => (
          <li key={x.id} className='py-2 border-b border-black/10'>
            <b>{x.type}</b> — ₦{x.amount} — {x.note || ''} — acct:{x.book.name}
            <form
              action={`/api/transaction/${x.id}`}
              method='post'
              className='inline-flex items-center gap-2 ml-2'
            >
              <input type='hidden' name='_method' value='DELETE' />
              <button
                className='inline-flex items-center h-10 px-4 rounded-lg border border-black/20'
                type='submit'
              >
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
