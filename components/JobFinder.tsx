
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, GroundingUrl, JobListing } from '../types';
import { findInternshipOpportunities } from '../services/geminiService';
import { 
  Loader2, 
  Briefcase, 
  ExternalLink, 
  Globe, 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  SortAsc, 
  RotateCcw, 
  Award, 
  Sparkles,
  MapPin,
  GraduationCap,
  Heart,
  Bookmark
} from 'lucide-react';

interface Props { profile: UserProfile; }

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

const JobCard: React.FC<{ 
  job: JobListing, 
  isSaved: boolean, 
  onToggleSave: (job: JobListing) => void,
  index: number 
}> = ({ job, isSaved, onToggleSave, index }) => (
  <div 
    className="group border border-indigo-50 bg-white p-6 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden animate-fade-in opacity-0"
    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
    
    <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
      <div className="flex-1 space-y-3">
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
            {job.category}
          </span>
          <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${job.jobType === 'Full-time' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
            {job.jobType}
          </span>
          <span className="text-xs text-indigo-300 font-semibold flex items-center">
            <span className="w-1 h-1 bg-indigo-200 rounded-full mx-2"></span>
            {job.postedDate}
          </span>
        </div>
        
        <div className="relative pr-12">
          <h3 className="text-xl font-extrabold text-indigo-950 group-hover:text-indigo-600 transition-colors leading-tight">
            {job.title}
          </h3>
          <p className="text-indigo-900 font-bold mt-1 text-lg">{job.company}</p>
          <p className="text-sm text-indigo-400 font-medium flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" /> {job.location}
          </p>

          {/* Absolute Save Button */}
          <button 
            onClick={() => onToggleSave(job)}
            className={`absolute top-0 right-0 p-2.5 rounded-xl border transition-all ${
              isSaved 
              ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm' 
              : 'bg-white border-indigo-50 text-indigo-200 hover:text-rose-400 hover:border-rose-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {job.description && (
          <p className="text-sm text-indigo-900/60 leading-relaxed line-clamp-2 italic border-l-2 border-indigo-100 pl-4 py-1">
            "{job.description}"
          </p>
        )}
      </div>

      <div className="w-full md:w-auto flex flex-col gap-2">
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-indigo-950 text-white px-6 py-4 rounded-xl hover:bg-indigo-800 transition-all shadow-md group-hover:scale-[1.02] active:scale-95 font-bold text-sm tracking-widest uppercase"
        >
          Apply Now
          <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  </div>
);

const JobFinder: React.FC<Props> = ({ profile }) => {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [sources, setSources] = useState<GroundingUrl[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobListing[]>(() => {
    const stored = localStorage.getItem(`saved_jobs_${profile.name}`);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [viewSavedOnly, setViewSavedOnly] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const isSenior = profile.classYear === 'Senior';

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    localStorage.setItem(`saved_jobs_${profile.name}`, JSON.stringify(savedJobs));
  }, [savedJobs, profile.name]);

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

  const toggleSaveJob = (job: JobListing) => {
    setSavedJobs(prev => {
      const isAlreadySaved = prev.some(j => j.url === job.url);
      if (isAlreadySaved) {
        return prev.filter(j => j.url !== job.url);
      } else {
        return [...prev, job];
      }
    });
  };

  const categories = useMemo(() => {
    const sourceList = viewSavedOnly ? savedJobs : listings;
    const cats = new Set(sourceList.map(l => l.category));
    return ['All', ...Array.from(cats)].sort();
  }, [listings, savedJobs, viewSavedOnly]);

  const filteredAndSorted = useMemo(() => {
    let result = viewSavedOnly ? [...savedJobs] : [...listings];
    
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
  }, [listings, savedJobs, filterCategory, sortOption, viewSavedOnly]);

  const fullTimeJobs = useMemo(() => filteredAndSorted.filter(j => j.jobType === 'Full-time'), [filteredAndSorted]);
  const internships = useMemo(() => filteredAndSorted.filter(j => j.jobType === 'Internship'), [filteredAndSorted]);

  const handleClearFilters = () => {
    setFilterCategory('All');
    setSortOption('newest');
    setViewSavedOnly(false);
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
      <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 overflow-hidden">
        {/* Modern Header */}
        <div className="bg-indigo-950 p-6 md:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                  {isSenior ? <Award className="h-6 w-6 text-white" /> : <Briefcase className="h-6 w-6 text-white" />}
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">
                  {viewSavedOnly ? 'My Bookmarks' : (isSenior ? 'Career Launch' : 'Internship Scout')}
                </h2>
              </div>
              <p className="text-indigo-200/80 text-sm font-medium mb-4">
                {viewSavedOnly ? `Reviewing your ${savedJobs.length} bookmarked opportunities.` : `Real-time scanning for ${profile.concentration} roles.`}
              </p>
              
              {/* Search Criteria Visualization */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest">
                  <MapPin className="w-3 h-3 text-emerald-400" /> {profile.preferredCities}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest">
                  <GraduationCap className="w-3 h-3 text-emerald-400" /> {profile.concentration}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setViewSavedOnly(!viewSavedOnly)}
                className={`w-full sm:w-auto flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  viewSavedOnly 
                  ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {viewSavedOnly ? 'Showing Saved' : `Saved (${savedJobs.length})`}
              </button>

              <button
                onClick={() => setShowControls(!showControls)}
                className={`w-full sm:w-auto flex items-center justify-center px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  showControls 
                  ? 'bg-white text-indigo-950 border-white' 
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showControls ? 'Hide Filters' : 'Filter & Sort'}
                {isFiltered && !showControls && (
                  <span className="ml-2 w-2 h-2 bg-emerald-400 rounded-full"></span>
                )}
              </button>
              
              {!viewSavedOnly && (
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full sm:w-auto group flex items-center justify-center px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Sparkles className="w-4 h-4 mr-3 text-white group-hover:rotate-12 transition-transform" />}
                  {loading ? 'Scanning...' : 'Scan New Openings'}
                </button>
              )}
            </div>
          </div>

          {!showControls && (isFiltered || viewSavedOnly) && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10 animate-fade-in">
              {viewSavedOnly && (
                 <span className="inline-flex items-center px-3 py-1.5 bg-rose-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest border border-rose-500/30 text-rose-200">
                  <Bookmark className="w-3 h-3 mr-2" /> Saved Only
                  <button onClick={() => setViewSavedOnly(false)} className="ml-2 hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterCategory !== 'All' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  <Filter className="w-3 h-3 mr-2" /> {filterCategory}
                  <button onClick={() => setFilterCategory('All')} className="ml-2 hover:text-emerald-400"><X className="w-3 h-3" /></button>
                </span>
              )}
              {sortOption !== 'newest' && (
                <span className="inline-flex items-center px-3 py-1.5 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  <SortAsc className="w-3 h-3 mr-2" /> {getSortLabel(sortOption)}
                  <button onClick={() => setSortOption('newest')} className="ml-2 hover:text-emerald-400"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {showControls && (
          <div className="bg-indigo-50/50 border-b border-indigo-100 p-6 md:px-10 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] flex items-center">
                  <Filter className="w-3 h-3 mr-2 text-indigo-400" /> Focus Category
                </label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white border border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 text-indigo-950 appearance-none shadow-sm cursor-pointer outline-none transition-all"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] flex items-center">
                  <SortAsc className="w-3 h-3 mr-2 text-indigo-400" /> Display Order
                </label>
                <div className="relative group">
                  <select 
                    className="w-full bg-white border border-indigo-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 text-indigo-950 appearance-none shadow-sm cursor-pointer outline-none transition-all"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                  >
                    <option value="newest">Freshness (Newest)</option>
                    <option value="oldest">Historical (Oldest)</option>
                    <option value="az">Alphabetical (A-Z)</option>
                    <option value="za">Reverse (Z-A)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>

            {isFiltered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center text-[10px] font-black text-indigo-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Reset all views
                </button>
              </div>
            )}
          </div>
        )}

        {/* Listings Area */}
        <div className="p-6 md:p-10 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
               <div className="relative">
                 <div className="h-16 w-16 border-4 border-indigo-100 border-t-emerald-500 rounded-full animate-spin"></div>
                 <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500" />
               </div>
               <div className="text-center space-y-2">
                 <h3 className="text-indigo-950 font-black text-xl uppercase tracking-widest">Scanning Networks</h3>
                 <p className="text-indigo-400 text-sm font-medium">Hunting for {profile.concentration} roles in {profile.preferredCities}...</p>
               </div>
            </div>
          ) : filteredAndSorted.length > 0 ? (
            <div className="space-y-16">
              {viewSavedOnly && (
                <div className="flex items-center justify-center bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 font-bold text-sm">
                  <Bookmark className="w-4 h-4 mr-2 fill-current" />
                  Viewing {filteredAndSorted.length} Bookmarked Listings
                </div>
              )}

              {fullTimeJobs.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-indigo-50"></div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Post-Grad Full-Time Roles</h3>
                    </div>
                    <div className="h-px flex-1 bg-indigo-50"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {fullTimeJobs.map((job, idx) => (
                      <JobCard 
                        key={`${job.url}-${filterCategory}-${sortOption}`}
                        job={job} 
                        isSaved={savedJobs.some(j => j.url === job.url)}
                        onToggleSave={toggleSaveJob}
                        index={idx}
                      />
                    ))}
                  </div>
                </section>
              )}

              {internships.length > 0 && (
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-indigo-50"></div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                        {isSenior ? 'Post-Grad Bridge Internships' : 'Summer 2026 Internships'}
                      </h3>
                    </div>
                    <div className="h-px flex-1 bg-indigo-50"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {internships.map((job, idx) => (
                      <JobCard 
                        key={`${job.url}-${filterCategory}-${sortOption}`}
                        job={job} 
                        isSaved={savedJobs.some(j => j.url === job.url)}
                        onToggleSave={toggleSaveJob}
                        index={fullTimeJobs.length + idx}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-indigo-50/20 rounded-[2.5rem] border-4 border-dashed border-indigo-50 flex flex-col items-center justify-center px-6">
              <div className="bg-white w-20 h-20 rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mb-8">
                {viewSavedOnly ? <Bookmark className="h-10 w-10 text-indigo-100" /> : <Search className="h-10 w-10 text-indigo-100" />}
              </div>
              <h3 className="text-indigo-950 font-black text-2xl mb-3">
                {viewSavedOnly ? 'No Saved Jobs' : 'No Openings Found Yet'}
              </h3>
              <p className="text-indigo-400 text-sm max-w-sm mx-auto mb-10 font-medium text-center">
                {viewSavedOnly 
                  ? "You haven't bookmarked any listings yet. Scan for new openings and hit the heart icon to save them for later."
                  : "We couldn't find active listings matching your current profile. Try scanning again or adjusting your cities."
                }
              </p>
              
              {!viewSavedOnly ? (
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex items-center justify-center px-10 py-5 bg-indigo-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-950/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Sparkles className="w-5 h-5 mr-3 text-emerald-400" />}
                  {loading ? 'Scanning...' : 'Start New Search'}
                </button>
              ) : (
                <button
                  onClick={() => setViewSavedOnly(false)}
                  className="flex items-center justify-center px-10 py-5 bg-indigo-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-950/20 active:scale-95"
                >
                  Return to Scout
                </button>
              )}

              {isFiltered && !viewSavedOnly && (
                <button 
                  onClick={handleClearFilters}
                  className="mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-200 transition-all pb-1"
                >
                  Clear search filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Verified Grounding Section */}
      {sources.length > 0 && !loading && !viewSavedOnly && (
        <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-sm animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em]">Verified Grounding Sources (Google Search)</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {sources.map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group inline-flex items-center px-4 py-2.5 bg-indigo-50/50 hover:bg-emerald-50 rounded-xl border border-indigo-100 hover:border-emerald-200 transition-all"
              >
                <span className="text-[11px] font-bold text-indigo-600 group-hover:text-emerald-700 truncate max-w-[200px]">{s.title}</span>
                <ExternalLink className="w-3 h-3 ml-2 text-indigo-300 group-hover:text-emerald-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFinder;
