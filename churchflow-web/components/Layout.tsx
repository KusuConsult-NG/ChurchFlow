import Link from 'next/link';
export default function Layout({children}:{children:any}){
  return (<main>
    <header className="topbar">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" width={36} height={36} alt="logo"/>
          <div className="font-semibold">ChurchFlow · ECWA</div>
        </div>
        <nav className="flex items-center gap-2">
          <Link className="btn" href="/org/create">Create Org</Link>
          <Link className="btn" href="/finance/income">Income</Link>
          <Link className="btn" href="/finance/expenditure">Expenditure</Link>
          <Link className="btn" href="/hr">HR</Link>
          <Link className="btn-primary" href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
    <div className="layout">
      <aside className="sidebar hidden sm:block">
        <div className="font-semibold mb-2">Menu</div>
        <Link className="navlink" href="/dashboard">Overview</Link>
        <Link className="navlink" href="/finance/income">Income</Link>
        <Link className="navlink" href="/finance/expenditure">Expenditures</Link>
        <Link className="navlink" href="/hr">HR</Link>
        <Link className="navlink" href="/reports">Reports</Link>
      </aside>
      <section className="p-4">{children}</section>
    </div>
  </main>);
}
