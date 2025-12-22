
export interface UserProfile {
  name: string;
  classYear: 'First-Year' | 'Sophomore' | 'Junior' | 'Senior';
  concentration: string;
  gpa: string;
  interests: string;
  preferredCities: string;
  hasResume: boolean;
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  postedDate: string; // Relative like "2 days ago"
  daysAgo: number;    // Numeric for sorting
  url: string;
  source: string;
  category: string;   // For filtering (Finance, Marketing, etc.)
  description: string;
}

export interface InternshipPlanItem {
  week: string;
  focus: string;
  tasks: string[];
  tips: string;
}

export interface InternshipPlan {
  summary: string;
  suggestedTitles: string[];
  timeline: InternshipPlanItem[];
  actionSteps: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GroundingUrl {
  uri: string;
  title: string;
}

export interface MapLocation {
  name: string;
  address: string;
  rating?: number;
  uri?: string;
}
