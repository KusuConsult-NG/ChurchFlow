'use client';

export default function FileUploadButton() {
  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      e.target.form.submit();
    }
  };

  return (
    <form
      action='/api/members/import'
      method='post'
      encType='multipart/form-data'
      className='inline-flex'
    >
      <input
        type='file'
        name='file'
        accept='.csv'
        className='hidden'
        id='file-input'
        onChange={handleFileChange}
      />
      <label htmlFor='file-input' className='btn-secondary cursor-pointer'>
        <svg
          className='w-4 h-4 mr-2'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
          />
        </svg>
        Import CSV
      </label>
    </form>
  );
}
