import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/src/lib/api';

export default function HR(){
  const [items,setItems]=useState<any[]>([]); const [form,setForm]=useState<any>({organizationId:'',firstName:'',lastName:'',roleTitle:'',startDate:'',contractType:'Full-time',salary:''}); const [msg,setMsg]=useState('');
  useEffect(()=>{ api.hr.staff.list().then(r=>setItems(r.items||[])).catch(()=>{}); },[]);
  async function submit(e:any){ e.preventDefault(); try{ const r = await api.hr.staff.create({...form, salary:Number(form.salary||0)}); setItems([r.staff, ...items]); setMsg('Staff added'); } catch(e:any){ setMsg(e.message); } }
  return (<Layout>
    <div className='grid gap-4 md:grid-cols-2'>
      <div className='card'>
        <h3 className='font-semibold mb-2'>Add Staff</h3>
        <form onSubmit={submit} className='space-y-2'>
          <input className='input' placeholder='Organization ID' value={form.organizationId} onChange={e=>setForm({...form,organizationId:e.target.value})}/>
          <div className='grid grid-cols-2 gap-2'>
            <input className='input' placeholder='First name' value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
            <input className='input' placeholder='Last name' value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/>
          </div>
          <input className='input' placeholder='Role title' value={form.roleTitle} onChange={e=>setForm({...form,roleTitle:e.target.value})}/>
          <div className='grid grid-cols-2 gap-2'>
            <input className='input' type='date' value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/>
            <input className='input' placeholder='Salary' type='number' value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})}/>
          </div>
          <button className='btn-primary'>Add</button>
          <div className='text-sm text-slate-600'>{msg}</div>
        </form>
      </div>
      <div className='card overflow-x-auto'>
        <h3 className='font-semibold mb-2'>Staff</h3>
        <table className='table'>
          <thead><tr><th>Started</th><th>Name</th><th>Role</th></tr></thead>
          <tbody>{items.map((x:any)=><tr key={x.id}><td>{new Date(x.startDate).toLocaleDateString()}</td><td>{x.firstName} {x.lastName}</td><td>{x.roleTitle}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  </Layout>);
}
