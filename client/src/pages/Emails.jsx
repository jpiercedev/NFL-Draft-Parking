import { useState, useEffect } from 'react';
import axios from 'axios';

function Emails() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#EDF0F4]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0449FE]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF0F4]">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#040510]">Email Templates</h1>
              <p className="mt-1 text-sm text-[#4C4E61]">
                Manage and customize your email notifications
              </p>
            </div>
            <button
              onClick={() => setShowNewTemplate(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0449FE] hover:bg-[#033ACC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-[#E53935] p-4 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-[#E53935]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-[#E53935]">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          <section aria-labelledby="default-templates-title" className="bg-white rounded-lg shadow-sm border border-[#A8B0C0] border-opacity-20 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#A8B0C0] border-opacity-20">
              <h2 id="default-templates-title" className="text-xl font-semibold text-[#040510]">
                Default Templates
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-[#EDF0F4] rounded-lg p-6">
                <h3 className="text-lg font-medium text-[#040510] mb-2">3-Day Reminder</h3>
                <p className="text-sm text-[#4C4E61] mb-4">
                  Sent 3 days before the reservation date
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-[#0449FE] text-[#0449FE] font-medium rounded-md hover:bg-[#0449FE] hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0449FE] focus:ring-offset-2"
                  onClick={() => {/* Preview template */}}
                >
                  Preview Template
                </button>
              </div>

              <div className="bg-[#EDF0F4] rounded-lg p-6">
                <h3 className="text-lg font-medium text-[#040510] mb-2">24-Hour Reminder</h3>
                <p className="text-sm text-[#4C4E61] mb-4">
                  Sent 24 hours before the reservation date
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-[#0449FE] text-[#0449FE] font-medium rounded-md hover:bg-[#0449FE] hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0449FE] focus:ring-offset-2"
                  onClick={() => {/* Preview template */}}
                >
                  Preview Template
                </button>
              </div>
            </div>
          </section>

          <section aria-labelledby="schedule-settings-title" className="bg-white rounded-lg shadow-sm border border-[#A8B0C0] border-opacity-20 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#A8B0C0] border-opacity-20">
              <h2 id="schedule-settings-title" className="text-xl font-semibold text-[#040510]">
                Email Schedule Settings
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-[#EDF0F4] rounded-lg p-6">
                <p className="text-base text-[#040510] mb-4">
                  Default schedule: Two reminder emails will be sent automatically
                </p>
                <ul className="space-y-2 text-[#4C4E61]">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-[#0449FE] mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    First reminder: 3 days before reservation date
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-[#0449FE] mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Second reminder: 24 hours before reservation date
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="sendgrid-status-title" className="bg-white rounded-lg shadow-sm border border-[#A8B0C0] border-opacity-20 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#A8B0C0] border-opacity-20">
              <h2 id="sendgrid-status-title" className="text-xl font-semibold text-[#040510]">
                SendGrid Integration Status
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-[#FEF3C7] rounded-lg p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-[#92400E]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-[#92400E]">
                      Make sure to configure your SendGrid API key in the server environment variables
                      to enable email functionality.
                    </p>
                  </div>
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
