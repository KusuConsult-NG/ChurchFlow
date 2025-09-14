import Layout from '@/components/Layout';
export default function Dashboard(){ 
  return (<Layout>
    <div className='grid md:grid-cols-3 gap-4'>
      <div className='card'><div className='text-slate-500 text-sm'>This Quarter</div><div className='text-2xl font-bold'>₦—</div></div>
      <div className='card'><div className='text-slate-500 text-sm'>Expenditure</div><div className='text-2xl font-bold'>₦—</div></div>
      <div className='card'><div className='text-slate-500 text-sm'>HR</div><div className='text-2xl font-bold'>— staff</div></div>
    </div>
  </Layout>);
}
