
import React, { useState } from 'react';
import { searchIndustryTrends, findCompaniesInCity } from '../services/geminiService';
import { UserProfile, GroundingUrl, MapLocation } from '../types';
import { Search, MapPin, ExternalLink, Loader2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  profile: UserProfile;
}

const Tools: React.FC<Props> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'map'>('trends');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ text: string, sources: GroundingUrl[] } | null>(null);
  const [searching, setSearching] = useState(false);

  // Map State
  const [cityQuery, setCityQuery] = useState(profile.preferredCities.split(',')[0].trim());
  const [mapResult, setMapResult] = useState<{ text: string, locations: MapLocation[] } | null>(null);
  const [mapping, setMapping] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await searchIndustryTrends(searchQuery);
      setSearchResult(res);
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  };

  const handleMapSearch = async () => {
    if (!cityQuery) return;
    setMapping(true);
    try {
      const res = await findCompaniesInCity(profile.concentration, cityQuery);
      setMapResult(res);
    } catch (e) { console.error(e); }
    finally { setMapping(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'trends' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
            <span className="flex items-center"><Search className="w-4 h-4 mr-2" /> Live Deadlines</span>
            </button>
            <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'map' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Find Companies</span>
            </button>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Research Uplink</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 min-h-[400px]">
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Search Live Internship Trends</h3>
                <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3 h-3" /> Real-time
                    </span>
                </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 caret-black text-black bg-white focus:outline-none"
                placeholder="e.g. Finance Internships Nov 2025 deadlines for Summer 2026"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={handleSearch}
                disabled={searching}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Search'}
              </button>
            </div>
            
            {searchResult && (
              <div className="mt-6 animate-fade-in">
                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <ReactMarkdown>{searchResult.text}</ReactMarkdown>
                </div>
                {searchResult.sources.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-gray-100">
                     <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sources (Google Search)</p>
                     <ul className="space-y-1">
                       {searchResult.sources.map((source, idx) => (
                         <li key={idx}>
                           <a href={source.uri} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                             <ExternalLink className="w-3 h-3 mr-1" /> {source.title}
                           </a>
                         </li>
                       ))}
                     </ul>
                   </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Locate Companies near {cityQuery}</h3>
             <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 caret-black text-black bg-white focus:outline-none"
                placeholder="Enter city name..."
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
              />
              <button 
                onClick={handleMapSearch}
                disabled={mapping}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {mapping ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Find'}
              </button>
            </div>

            {mapResult && (
                <div className="mt-6 animate-fade-in">
                     <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <ReactMarkdown>{mapResult.text}</ReactMarkdown>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
