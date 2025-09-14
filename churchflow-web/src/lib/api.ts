const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
async function req(path:string, method='GET', body?:any){
  const headers:any = {'Content-Type':'application/json'};
  const token = typeof window!=='undefined' ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, { method, headers, body: body? JSON.stringify(body): undefined });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const api = {
  register:(d:any)=>req('/auth/register','POST',d),
  login:(d:any)=>req('/auth/login','POST',d),
  me:()=>req('/me'),
  createOrg:(d:any)=>req('/org/create','POST',d),
  income:{ list:(orgId?:string)=>req('/finance/income'+(orgId?`?organizationId=${orgId}`:'')), create:(d:any)=>req('/finance/income','POST',d)},
  exp:{ list:(orgId?:string)=>req('/finance/expenditures'+(orgId?`?organizationId=${orgId}`:'')), create:(d:any)=>req('/finance/expenditures','POST',d), update:(id:string, d:any)=>req('/finance/expenditures/'+id,'PATCH',d)},
  hr:{ staff:{list:(orgId?:string)=>req('/hr/staff'+(orgId?`?organizationId=${orgId}`:'')), create:(d:any)=>req('/hr/staff','POST',d)} }
}
