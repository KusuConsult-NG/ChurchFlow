async function getSign() {
  const res = await fetch('/api/cloudinary/sign', { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page() {
  const sign = await getSign().catch(() => null);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>File Uploads</h2>

      {sign ? (
        <form
          action={`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`}
          method='post'
          encType='multipart/form-data'
          className='grid gap-4 max-w-lg'
        >
          <input type='hidden' name='api_key' value={sign.apiKey} />
          <input
            type='hidden'
            name='timestamp'
            value={String(sign.timestamp)}
          />
          <input type='hidden' name='signature' value={sign.signature} />

          <div>
            <label
              htmlFor='file'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Select File
            </label>
            <input
              type='file'
              name='file'
              id='file'
              required
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
          </div>

          <button type='submit' className='btn-primary'>
            Upload to Cloudinary
          </button>
        </form>
      ) : (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-yellow-800'>
            Signing failed — check Cloudinary environment variables.
          </p>
        </div>
      )}
    </main>
  );
}
