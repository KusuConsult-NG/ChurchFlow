export default function ExpenditureExtraFields({ value, onChange }:{ value:{ beneficiaryName?:string; bankName?:string; accountNumber?:string }, onChange:(v:any)=>void }){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div>
        <label className="text-sm text-gray-600">Beneficiary Name</label>
        <input className="border rounded px-3 py-2 w-full" value={value.beneficiaryName||''} onChange={e=>onChange({ ...value, beneficiaryName: e.target.value })}/>
      </div>
      <div>
        <label className="text-sm text-gray-600">Bank Name</label>
        <input className="border rounded px-3 py-2 w-full" value={value.bankName||''} onChange={e=>onChange({ ...value, bankName: e.target.value })}/>
      </div>
      <div>
        <label className="text-sm text-gray-600">Account Number</label>
        <input className="border rounded px-3 py-2 w-full" value={value.accountNumber||''} onChange={e=>onChange({ ...value, accountNumber: e.target.value })}/>
      </div>
    </div>
  );
}
