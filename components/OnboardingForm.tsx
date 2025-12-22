import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingForm: React.FC<Props> = ({ onComplete }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    classYear: 'Junior',
    concentration: 'Management & Business',
    gpa: '3.5',
    interests: '',
    preferredCities: 'New York, Boston',
    hasResume: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-emerald-100">
      <h2 className="text-3xl font-bold text-emerald-900 mb-2">Let's build your strategy.</h2>
      <p className="text-gray-600 mb-8">Tell us about your Skidmore journey so far.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input 
            type="text" 
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black caret-black text-black bg-gray-50 p-3"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Class Year</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black bg-gray-50 p-3"
              value={formData.classYear}
              onChange={e => setFormData({...formData, classYear: e.target.value as any})}
            >
              <option value="First-Year">First-Year</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Major / Concentration</label>
            <input 
              type="text" 
              placeholder="e.g. Finance, Marketing, Psych"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black caret-black text-black bg-gray-50 p-3"
              value={formData.concentration}
              onChange={e => setFormData({...formData, concentration: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current GPA (Approx)</label>
            <input 
              type="text" 
              placeholder="3.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black caret-black text-black bg-gray-50 p-3"
              value={formData.gpa}
              onChange={e => setFormData({...formData, gpa: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Cities</label>
            <input 
              type="text" 
              placeholder="NYC, Boston, Remote"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black caret-black text-black bg-gray-50 p-3"
              value={formData.preferredCities}
              onChange={e => setFormData({...formData, preferredCities: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Career Interests</label>
          <textarea 
            rows={3}
            placeholder="e.g. I want to work in sustainable fashion marketing or investment banking."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black caret-black text-black bg-gray-50 p-3"
            value={formData.interests}
            onChange={e => setFormData({...formData, interests: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
        >
          Create My Strategy
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;