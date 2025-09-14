import { useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/src/lib/api';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState('');
  async function submit(e:any){ e.preventDefault(); try{ const r = await api.login({email,password}); localStorage.setItem('token', r.token); setMsg('Logged in'); } catch(e:any){ setMsg(e.message); } }
  return (<Layout>
    <div className='max-w-md mx-auto card'>
      <h2 className='text-xl font-semibold mb-3'>Log In</h2>
      <form onSubmit={submit} className='space-y-3'>
        <input className='input' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className='input' placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className='btn-primary'>Log In</button>
        <div className='text-sm text-slate-600'>{msg}</div>
      </form>
    </div>
  </Layout>);
}
