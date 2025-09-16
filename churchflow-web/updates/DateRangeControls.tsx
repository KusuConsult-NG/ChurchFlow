import { useState } from 'react';
type Preset = 'Quarter'|'Month'|'Week'|'Year';
export default function DateRangeControls({ value, onChange }:{ value:{ from:string; to:string; preset:Preset }, onChange:(v:any)=>void }){
  const [p,setP] = useState<Preset>(value.preset);
  function setPreset(next:Preset){ setP(next); onChange({ ...value, preset: next }); }
  return (
    <div className="flex items-center gap-2">
      <button className="px-2 py-1 border rounded" onClick={()=>onChange({ ...value, page:-1 })}>{'‹'}</button>
      <input type="date" value={value.from} onChange={e=>onChange({ ...value, from:e.target.value })} className="border rounded px-2 py-1"/>
      <span>—</span>
      <input type="date" value={value.to} onChange={e=>onChange({ ...value, to:e.target.value })} className="border rounded px-2 py-1"/>
      <select value={p} onChange={e=>setPreset(e.target.value as Preset)} onBlur={e=>setPreset(e.target.value as Preset)} className="border rounded px-2 py-1">
        {(['Quarter','Month','Week','Year'] as Preset[]).map(x=> <option key={x} value={x}>{x}</option>)}
      </select>
      <button className="px-2 py-1 border rounded" onClick={()=>onChange({ ...value, page:1 })}>{'›'}</button>
    </div>
  );
}
