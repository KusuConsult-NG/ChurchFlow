async function getSign(){ const res=await fetch(`/api/cloudinary/sign`,{cache:'no-store'}); if(!res.ok) return null; return res.json(); }
export default async function Page(){
  const sign = await getSign().catch(()=>null);
  return (<main><h2 className="text-2xl font-bold">Uploads</h2>
    {sign? <form action={`https://api.cloudinary.com/v1_1/${sign.cloud}/auto/upload`} method="post" encType="multipart/form-data" className="grid gap-2 max-w-lg mt-2">
      <input type="hidden" name="api_key" value={sign.apiKey}/>
      <input type="hidden" name="timestamp" value={String(sign.timestamp)}/>
      <input type="hidden" name="folder" value={sign.folder}/>
      <input type="hidden" name="signature" value={sign.signature}/>
      <input type="file" name="file" required className="h-10"/>
      <button className="inline-flex items-center h-10 px-4 rounded-lg bg-black text-white" type="submit">Upload to Cloudinary</button>
    </form> : <p>Signing failed — check Cloudinary env vars.</p>}
  </main>);
}
