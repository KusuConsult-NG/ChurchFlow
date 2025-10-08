import { safeFindMany } from '../../../lib/database-safe';

export default async function Page() {
  // Use safe database operation that won't fail during build
  const items = await safeFindMany('accountBook', {
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main>
      <h2 className='text-2xl font-bold'>Accounts</h2>
      <form
        action='/api/accountBook'
        method='post'
        className='grid gap-2 max-w-lg mt-2'
      >
        <input
          name='name'
          placeholder='Name'
          className='h-10 px-3 rounded-lg border border-black/15'
        />
        <input
          name='balance'
          type='number'
          defaultValue='0'
          placeholder='Opening Balance'
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
            <b>{x.name}</b> — ₦{x.balance}
            <form
              action={`/api/accountBook/${x.id}`}
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
