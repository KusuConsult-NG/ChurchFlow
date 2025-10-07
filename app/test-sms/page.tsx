'use client';

import { useState } from 'react';

export default function TestSMS() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState(
    'Hello from ChurchFlow! This is a test SMS message.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !message) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to send SMS');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-xl'>📱</span>
            </div>
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            SMS Service Test
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Test your Twilio SMS integration by sending a message to any phone
            number
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* SMS Form */}
          <div className='bg-white rounded-xl shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Send Test SMS
            </h2>

            <form onSubmit={handleSendSMS} className='space-y-6'>
              <div>
                <label
                  htmlFor='phoneNumber'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Phone Number
                </label>
                <input
                  type='tel'
                  id='phoneNumber'
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder='+1234567890'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Use international format (e.g., +1234567890)
                </p>
              </div>

              <div>
                <label
                  htmlFor='message'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Message
                </label>
                <textarea
                  id='message'
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  {message.length}/160 characters
                </p>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                    Sending SMS...
                  </div>
                ) : (
                  'Send SMS'
                )}
              </button>
            </form>

            {error && (
              <div className='mt-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-center'>
                  <span className='text-red-500 text-xl mr-2'>❌</span>
                  <p className='text-red-700 font-medium'>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className='bg-white rounded-xl shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              SMS Status
            </h2>

            {result ? (
              <div className='space-y-4'>
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='flex items-center mb-2'>
                    <span className='text-green-500 text-xl mr-2'>✅</span>
                    <p className='text-green-700 font-medium'>
                      SMS Sent Successfully!
                    </p>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Message ID:</span>
                    <span className='font-mono text-sm'>
                      {result.messageId}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Status:</span>
                    <span className='text-green-600 font-medium'>
                      {result.status}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>To:</span>
                    <span className='font-medium'>{result.to}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>From:</span>
                    <span className='font-medium'>{result.from}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Sent:</span>
                    <span className='text-sm'>
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <h3 className='text-blue-800 font-medium mb-2'>
                    Message Preview:
                  </h3>
                  <p className='text-blue-700'>{result.body}</p>
                </div>
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-gray-400 text-2xl'>📱</span>
                </div>
                <p className='text-gray-500'>
                  Send a test SMS to see the results here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Service Info */}
        <div className='mt-12 bg-white rounded-xl shadow-lg p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            SMS Service Information
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                Twilio Configuration
              </h3>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Service:</span>
                  <span className='font-medium'>Twilio SMS</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Status:</span>
                  <span className='text-green-600 font-medium'>Active</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Phone Number:</span>
                  <span className='font-medium'>+16169478878</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                Features
              </h3>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>✅ International SMS delivery</li>
                <li>✅ Delivery status tracking</li>
                <li>✅ Error handling</li>
                <li>✅ Rate limiting</li>
                <li>✅ Bulk messaging</li>
                <li>✅ Template support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
