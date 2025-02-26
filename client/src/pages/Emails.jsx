import { useState, useEffect } from 'react';
import axios from 'axios';

function Emails() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/emails/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage email templates and scheduled notifications
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-6">
          <section aria-labelledby="default-templates-title">
            <h2 id="default-templates-title" className="text-lg font-medium text-gray-900">
              Default Templates
            </h2>
            <div className="mt-4 space-y-4">
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">3-Day Reminder</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sent 3 days before the reservation date
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {/* Preview template */}}
                    >
                      Preview Template
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">24-Hour Reminder</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Sent 24 hours before the reservation date
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {/* Preview template */}}
                    >
                      Preview Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="schedule-settings-title" className="mt-8">
            <h2 id="schedule-settings-title" className="text-lg font-medium text-gray-900">
              Email Schedule Settings
            </h2>
            <div className="mt-4 bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-700">
                Default schedule: Two reminder emails will be sent automatically
              </p>
              <ul className="mt-4 text-sm text-gray-600 list-disc list-inside space-y-2">
                <li>First reminder: 3 days before reservation date</li>
                <li>Second reminder: 24 hours before reservation date</li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="sendgrid-status-title" className="mt-8">
            <h2 id="sendgrid-status-title" className="text-lg font-medium text-gray-900">
              SendGrid Integration Status
            </h2>
            <div className="mt-4 bg-yellow-50 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Make sure to configure your SendGrid API key in the server environment variables
                    to enable email functionality.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Emails;
