import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default async function Page() {
  const items = await prisma.requisition.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return (
    <main>
      <h2 className='text-2xl font-bold'>Requisitions</h2>
      <form
        action='/api/requisition'
        method='post'
        className='grid gap-2 max-w-lg mt-2'
      >
        <input
          name='title'
          placeholder='Title'
          className='h-10 px-3 rounded-lg border border-black/15'
        />
        <input
          name='amount'
          type='number'
          defaultValue='0'
          placeholder='Amount'
          className='h-10 px-3 rounded-lg border border-black/15'
        />
        <input
          name='status'
          defaultValue='PENDING'
          placeholder='Status'
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
            <b>{x.title}</b> — ₦{x.amount} — {x.status}
            <form
              action={`/api/requisition/${x.id}`}
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
