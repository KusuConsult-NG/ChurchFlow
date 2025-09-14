import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/src/lib/api';

export default function Income(){
  const [items,setItems]=useState<any[]>([]); const [form,setForm]=useState<any>({organizationId:'',sourceName:'',narration:'',amount:''}); const [msg,setMsg]=useState('');
  useEffect(()=>{ api.income.list().then(r=>setItems(r.items||[])).catch(()=>{}); },[]);
  async function submit(e:any){ e.preventDefault(); try{ const r = await api.income.create({...form, amount: Number(form.amount||0)}); setItems([r.item, ...items]); setMsg('Saved'); } catch(e:any){ setMsg(e.message); } }
  return (<Layout>
    <div className='grid gap-4 md:grid-cols-2'>
      <div className='card'>
        <h3 className='font-semibold mb-2'>Add Income</h3>
        <form onSubmit={submit} className='space-y-2'>
          <input className='input' placeholder='Organization ID' value={form.organizationId} onChange={e=>setForm({...form,organizationId:e.target.value})}/>
          <input className='input' placeholder='Source (Giver/Transfer)' value={form.sourceName} onChange={e=>setForm({...form,sourceName:e.target.value})}/>
          <input className='input' placeholder='Narration' value={form.narration} onChange={e=>setForm({...form,narration:e.target.value})}/>
          <input className='input' placeholder='Amount' type='number' value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
          <button className='btn-primary'>Save</button>
          <div className='text-sm text-slate-600'>{msg}</div>
        </form>
      </div>
      <div className='card overflow-x-auto'>
        <h3 className='font-semibold mb-2'>Recent Income</h3>
        <table className='table'>
          <thead><tr><th>Date</th><th>Source</th><th>Narration</th><th>Amount</th></tr></thead>
          <tbody>{items.map((x:any)=><tr key={x.id}><td>{new Date(x.date).toLocaleString()}</td><td>{x.sourceName}</td><td>{x.narration}</td><td>₦{x.amount}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </Layout>);
}
