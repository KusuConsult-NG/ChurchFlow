import { useEffect, useState } from 'react';
import axios from 'axios';

type Org = { id: string; name: string };

export default function OrgSelect({ apiBase, onChange }:{ apiBase:string; onChange:(ids:{dcc?:string,lcc?:string,lc?:string})=>void }) {
  const [dcc, setDcc] = useState<Org[]>([]);
  const [lcc, setLcc] = useState<Org[]>([]);
  const [lc, setLc] = useState<Org[]>([]);
  const [sel, setSel] = useState<{dcc?:string,lcc?:string,lc?:string}>({});

  useEffect(()=> { axios.get(`${apiBase}/api/orgs/dcc`).then(r=> setDcc(r.data)); }, [apiBase]);
  useEffect(()=> {
    if (!sel.dcc) { setLcc([]); setLc([]); onChange(sel); return; }
    axios.get(`${apiBase}/api/orgs/lcc`, { params: { dcc_id: sel.dcc } }).then(r=> setLcc(r.data));
  }, [sel.dcc]);
  useEffect(()=> {
    if (!sel.lcc) { setLc([]); onChange(sel); return; }
    axios.get(`${apiBase}/api/orgs/lc`, { params: { lcc_id: sel.lcc } }).then(r=> setLc(r.data));
  }, [sel.lcc]);

  function upd(partial: Partial<{dcc:string,lcc:string,lc:string}>){
    const next = { ...sel, ...partial };
    if (partial.dcc) next.lcc = undefined, next.lc = undefined;
    if (partial.lcc) next.lc = undefined;
    setSel(next);
    onChange(next);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <select value={sel.dcc||''} onChange={e=>upd({dcc:e.target.value||undefined})} className="border rounded px-3 py-2">
        <option value="">Select DCC</option>
        {dcc.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select value={sel.lcc||''} onChange={e=>upd({lcc:e.target.value||undefined})} className="border rounded px-3 py-2">
        <option value="">Select LCC</option>
        {lcc.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select value={sel.lc||''} onChange={e=>upd({lc:e.target.value||undefined})} className="border rounded px-3 py-2">
        <option value="">Select LC</option>
        {lc.map(o=> <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}
