export default function IncomeExtraFields({ value, onChange }:{ value:{ giverName?:string; narration?:string }, onChange:(v:any)=>void }){
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div>
        <label className="text-sm text-gray-600">Giver / Source Name</label>
        <input className="border rounded px-3 py-2 w-full" value={value.giverName||''} onChange={e=>onChange({ ...value, giverName: e.target.value })}/>
      </div>
      <div>
        <label className="text-sm text-gray-600">Narration</label>
        <input className="border rounded px-3 py-2 w-full" value={value.narration||''} onChange={e=>onChange({ ...value, narration: e.target.value })}/>
      </div>
    </div>
  );
}
