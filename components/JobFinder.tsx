
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, GroundingUrl, JobListing } from '../types';
import { findInternshipOpportunities } from '../services/geminiService';
import { Loader2, Briefcase, ExternalLink, Globe, Search, Filter, ChevronDown, X, SortAsc, RotateCcw } from 'lucide-react';

interface Props { profile: UserProfile; }

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

const JobFinder: React.FC<Props> = ({ profile }) => {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [sources, setSources] = useState<GroundingUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Filter & Sort State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await findInternshipOpportunities(profile);
      setListings(data.listings);
      setSources(data.sources);
    } catch (error) {
      console.error("Error finding jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(listings.map(l => l.category));
    return ['All', ...Array.from(cats)].sort();
  }, [listings]);

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];
    if (filterCategory !== 'All') {
      result = result.filter(l => l.category === filterCategory);
    }
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return a.daysAgo - b.daysAgo;
        case 'oldest': return b.daysAgo - a.daysAgo;
        case 'az': return a.title.localeCompare(b.title);
        case 'za': return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
    return result;
  }, [listings, filterCategory, sortOption]);

  const handleClearFilters = () => {
    setFilterCategory('All');
    setSortOption('newest');
  };

  const getSortLabel = (opt: SortOption) => {
    switch(opt) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      case 'az': return 'A-Z';
      case 'za': return 'Z-A';
    }
  };

  const isFiltered = filterCategory !== 'All' || sortOption !== 'newest';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-900 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-700/50 p-2 rounded-lg backdrop-blur-sm">
                  <Briefcase className="h-6 w-6 text-indigo-100" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Summer 2026 Opportunities</h2>
              </div>
              <p className="text-indigo-100/80 text-sm max-w-xl">
                Searching real-time ATS boards for <strong>{profile.concentration}</strong> roles in <strong>{profile.preferredCities}</strong>.
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowControls(!showControls)}
                className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  showControls 
                  ? 'bg-white text-indigo-900 border-white' 
                  : 'bg-indigo-800/40 text-white border-indigo-700/50 hover:bg-indigo-800/60'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showControls ? 'Close Filters' : 'Filter & Sort'}
                {isFiltered && !showControls && (
                  <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
                )}
              </button>
              
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-yellow-400 text-indigo-950 rounded-xl text-sm font-bold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/10 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                {loading ? 'Searching...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Active Filters Summary (Visible when panel is closed) */}
          {!showControls && isFiltered && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-indigo-800/50 animate-fade-in">
              {filterCategory !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 bg-indigo-800/60 rounded-full text-xs font-medium border border-indigo-700/50">
                  <Filter className="w-3 h-3 mr-1.5" /> {filterCategory}
                  <button onClick={() => setFilterCategory('All')} className="ml-2 hover:text-yellow-400"><X className="w-3 h-3" /></button>
                </span>
              )}
              {sortOption !== 'newest' && (
                <span className="inline-flex items-center px-3 py-1 bg-indigo-800/60 rounded-full text-xs font-medium border border-indigo-700/50">
                  <SortAsc className="w-3 h-3 mr-1.5" /> Sort: {getSortLabel(sortOption)}
                  <button onClick={() => setSortOption('newest')} className="ml-2 hover:text-yellow-400"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Control Panel */}
        {showControls && (
          <div className="bg-indigo-50 border-b border-indigo-100 p-6 md:px-8 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center">
                  <Filter className="w-3 h-3 mr-2" /> Filter by Concentration
                </label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-indigo-950 appearance-none shadow-sm cursor-pointer"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center">
                  <SortAsc className="w-3 h-3 mr-2" /> Sort Listings
                </label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 text-indigo-950 appearance-none shadow-sm cursor-pointer"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                  >
                    <option value="newest">Newest Postings First</option>
                    <option value="oldest">Oldest Postings First</option>
                    <option value="az">Role Title (A to Z)</option>
                    <option value="za">Role Title (Z to A)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>

            {isFiltered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Listings Content */}
        <div className="p-6 md:p-8 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
               <div className="relative">
                 <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                 <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
               </div>
               <div className="text-center">
                 <p className="text-indigo-900 font-bold text-lg">Scanning ATS Networks</p>
                 <p className="text-indigo-400 text-sm">Validating Summer 2026 roles at Greenhouse & Lever...</p>
               </div>
            </div>
          ) : filteredAndSorted.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSorted.map((job, idx) => (
                <div key={idx} className="group border border-indigo-50 bg-white p-6 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
                          {job.category}
                        </span>
                        <span className="text-xs text-indigo-300 font-semibold flex items-center">
                          <span className="w-1 h-1 bg-indigo-200 rounded-full mx-2"></span>
                          {job.postedDate}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-extrabold text-indigo-950 group-hover:text-indigo-600 transition-colors leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-indigo-900 font-bold mt-1 text-lg">{job.company}</p>
                        <p className="text-sm text-indigo-400 font-medium flex items-center mt-1">
                          📍 {job.location}
                        </p>
                      </div>

                      {job.description && (
                        <p className="text-sm text-indigo-900/60 leading-relaxed line-clamp-2 italic border-l-2 border-indigo-100 pl-4 py-1">
                          "{job.description}"
                        </p>
                      )}
                    </div>

                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto flex items-center justify-center bg-indigo-950 text-white px-6 py-3 rounded-xl hover:bg-indigo-800 transition-all shadow-md group-hover:scale-[1.02] active:scale-95 font-bold text-sm tracking-wide"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-indigo-50/30 rounded-3xl border-2 border-dashed border-indigo-100">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-indigo-200" />
              </div>
              <h3 className="text-indigo-900 font-bold text-lg">No matches found</h3>
              <p className="text-indigo-400 text-sm max-w-xs mx-auto mt-1">
                Try clearing your filters or refresh to scan more sources.
              </p>
              {isFiltered && (
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 text-indigo-600 font-bold text-sm underline underline-offset-4 hover:text-indigo-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {sources.length > 0 && !loading && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-50 shadow-sm animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-black text-indigo-900/40 uppercase tracking-[0.2em]">Verified Grounding Sources</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {sources.map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noreferrer" 
                className="group text-xs text-indigo-600 hover:text-indigo-900 font-bold flex items-center bg-indigo-50/50 hover:bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 transition-all"
              >
                <span className="truncate max-w-[200px]">{s.title}</span>
                <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFinder;
