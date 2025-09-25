import { PrismaClient } from "@prisma/client"; const prisma=new PrismaClient();
export default async function Page(){ const items=await prisma.project.findMany({ orderBy:{ createdAt:'desc' } });
  return (<main><h2 className="text-2xl font-bold">Projects</h2>
    <form action="/api/project" method="post" className="grid gap-2 max-w-lg mt-2">
      <input name="name" placeholder="Name" className="h-10 px-3 rounded-lg border border-black/15"/>
      <input name="status" defaultValue="NEW" placeholder="Status" className="h-10 px-3 rounded-lg border border-black/15"/>
      <input name="budget" type="number" defaultValue="0" placeholder="Budget" className="h-10 px-3 rounded-lg border border-black/15"/>
      <button className="inline-flex items-center h-10 px-4 rounded-lg bg-black text-white" type="submit">Create</button>
    </form>
    <ul className="mt-3">{items.map(x=> (<li key={x.id} className="py-2 border-b border-black/10"><b>{x.name}</b> — {x.status} — ₦{x.budget}
      <form action={`/api/project/${x.id}`} method="post" className="inline-flex items-center gap-2 ml-2">
        <input type="hidden" name="_method" value="DELETE" /><button className="inline-flex items-center h-10 px-4 rounded-lg border border-black/20" type="submit">Delete</button>
      </form>
    </li>))}</ul></main>);
}
