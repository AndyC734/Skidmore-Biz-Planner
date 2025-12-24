
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
  postedDate: string;
  daysAgo: number;
  url: string;
  source: string;
  category: string;
  description: string;
  jobType: 'Internship' | 'Full-time';
}

export interface AlumniProfile {
  name: string;
  classYear: string;
  major: string;
  currentRole: string;
  company: string;
  location: string;
  pathway: string[]; // Steps like ["SGA Treasurer", "Intern @ Citi", "Analyst @ Goldman"]
  advice: string;
  skidmoreConnection: string; // e.g., "Former Peer Mentor", "Career Jam Speaker"
  linkedInUrl?: string;
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
