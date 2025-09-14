import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/src/lib/api';

export default function Expenditure(){
  const [items,setItems]=useState<any[]>([]); const [form,setForm]=useState<any>({organizationId:'',title:'',amount:'',beneficiaryName:'',beneficiaryAccount:'',beneficiaryBank:'',requiresCEL:false}); const [msg,setMsg]=useState('');
  useEffect(()=>{ api.exp.list().then(r=>setItems(r.items||[])).catch(()=>{}); },[]);
  async function submit(e:any){ e.preventDefault(); try{ const r = await api.exp.create({...form, amount: Number(form.amount||0)}); setItems([r.item, ...items]); setMsg('Submitted'); } catch(e:any){ setMsg(e.message); } }
  return (<Layout>
    <div className='grid gap-4 md:grid-cols-2'>
      <div className='card'>
        <h3 className='font-semibold mb-2'>Raise Expenditure</h3>
        <form onSubmit={submit} className='space-y-2'>
          <input className='input' placeholder='Organization ID' value={form.organizationId} onChange={e=>setForm({...form,organizationId:e.target.value})}/>
          <input className='input' placeholder='Title' value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
          <input className='input' placeholder='Amount' type='number' value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
          <input className='input' placeholder='Beneficiary Name' value={form.beneficiaryName} onChange={e=>setForm({...form,beneficiaryName:e.target.value})}/>
          <input className='input' placeholder='Beneficiary Account' value={form.beneficiaryAccount} onChange={e=>setForm({...form,beneficiaryAccount:e.target.value})}/>
          <input className='input' placeholder='Beneficiary Bank' value={form.beneficiaryBank} onChange={e=>setForm({...form,beneficiaryBank:e.target.value})}/>
          <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={form.requiresCEL} onChange={e=>setForm({...form,requiresCEL:e.target.checked})}/> Agency/CEL required</label>
          <button className='btn-primary'>Submit</button>
          <div className='text-sm text-slate-600'>{msg}</div>
        </form>
      </div>
      <div className='card overflow-x-auto'>
        <h3 className='font-semibold mb-2'>Recent Expenditures</h3>
        <table className='table'>
          <thead><tr><th>Date</th><th>Title</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{items.map((x:any)=><tr key={x.id}><td>{new Date(x.createdAt).toLocaleString()}</td><td>{x.title}</td><td>₦{x.amount}</td><td>{x.status}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </Layout>);
}
