import Link from 'next/link';
import Layout from '@/components/Layout';
export default function Home(){
  return (<Layout>
    <div className='mx-auto max-w-3xl'>
      <div className='card'>
        <div className='flex items-center gap-3'>
          <img src='/logo.png' width={48} height={48} alt='logo'/>
          <div>
            <h1 className='text-2xl font-bold'>ChurchFlow — ECWA Finance & HR</h1>
            <p className='text-slate-600'>Manage income, expenditures with approvals, and HR in one place.</p>
          </div>
        </div>
        <div className='mt-4 flex gap-2'>
          <Link className='btn' href='/auth/signup'>Sign Up</Link>
          <Link className='btn-primary' href='/auth/login'>Log In</Link>
          <Link className='btn' href='/org/create'>Create Organization</Link>
        </div>
      </div>
    </div>
  </Layout>);
}
