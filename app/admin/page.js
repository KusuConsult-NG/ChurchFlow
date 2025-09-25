import { PrismaClient } from "@prisma/client";
const prisma=new PrismaClient();
export default async function Admin(){
  const items=await prisma.announcement.findMany({ orderBy:{ createdAt:'desc' } });
  return (<main>
    <h2 className="text-2xl font-bold">Announcements</h2>
    <form action="/api/announcement" method="post" className="grid gap-2 max-w-lg mt-2">
      <input name="title" placeholder="Title" className="h-10 px-3 rounded-lg border border-black/15"/>
      <textarea name="body" placeholder="Body" className="rounded-lg border border-black/15 px-3 py-2"></textarea>
      <button className="inline-flex items-center h-10 px-4 rounded-lg bg-black text-white" type="submit">Create</button>
    </form>
    <ul className="mt-3">{items.map(a=> (<li key={a.id} className="py-2 border-b border-black/10"><b>{a.title}</b> — {a.body}
      <form action={`/api/announcement/${a.id}`} method="post" className="inline-flex items-center gap-2 ml-2">
        <input type="hidden" name="_method" value="DELETE" /><button className="inline-flex items-center h-10 px-4 rounded-lg border border-black/20" type="submit">Delete</button>
      </form>
    </li>))}</ul>
  </main>);
}
