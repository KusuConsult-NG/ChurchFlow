import { useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/src/lib/api';

const councils = ['HQ','GCC','DCC','LCC','LC'];

export default function CreateOrg(){
  const [name,setName]=useState(''); const [council,setCouncil]=useState('LC'); const [msg,setMsg]=useState('');
  async function submit(e:any){ e.preventDefault(); try{ await api.createOrg({name,council}); setMsg('Organization created'); } catch(e:any){ setMsg(e.message); } }
  return (<Layout>
    <div className='max-w-lg mx-auto card'>
      <h2 className='text-xl font-semibold mb-3'>Create Organization</h2>
      <form onSubmit={submit} className='space-y-3'>
        <input className='input' placeholder='Name' value={name} onChange={e=>setName(e.target.value)}/>
        <select className='select' value={council} onChange={e=>setCouncil(e.target.value)}>
          {councils.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <button className='btn-primary'>Create</button>
        <div className='text-sm text-slate-600'>{msg}</div>
      </form>
    </div>
  </Layout>);
}
