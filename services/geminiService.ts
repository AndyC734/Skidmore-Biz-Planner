
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { InternshipPlan, UserProfile, MapLocation, GroundingUrl, JobListing, AlumniProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_BASE = `
You are a savvy Senior Management & Business major at Skidmore College acting as a career coach.
You know the ins and outs of Skidmore's Career Development Center (CDC), Handshake, and the specific recruiting timelines for different industries.
You are encouraging but realistic. Context: Current Date is Late November 2025. You are focusing on Summer 2026 placements.
`;

export const generateInternshipPlan = async (profile: UserProfile): Promise<InternshipPlan> => {
  const prompt = `
    Create a detailed 12-16 week internship search plan for a ${profile.classYear} Skidmore student targeting Summer 2026 internships.
    Major Concentration: ${profile.concentration}
    GPA: ${profile.gpa}
    Interests: ${profile.interests}
    Target Cities: ${profile.preferredCities}

    Return ONLY JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      suggestedTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.STRING },
            focus: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.STRING },
          },
          required: ["week", "focus", "tasks", "tips"],
        },
      },
      actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["summary", "suggestedTitles", "timeline", "actionSteps"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 32768 }, 
    },
  });

  return JSON.parse(response.text || "{}") as InternshipPlan;
};

export const getAlumniProfiles = async (major: string): Promise<AlumniProfile[]> => {
  const prompt = `
    Generate 4 diverse and realistic alumni profiles for a Skidmore College major in "${major}".
    Base these on common career outcomes for Skidmore grads (e.g., MB majors often go to Finance or Creative agencies; Art majors to Galleries or UX; Psych to HR or research).
    Include one recent grad (2022-2024) and one more senior alum.
    For each, include a realistic LinkedIn URL like https://www.linkedin.com/in/name-skidmore.
    Return ONLY JSON.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        classYear: { type: Type.STRING },
        major: { type: Type.STRING },
        currentRole: { type: Type.STRING },
        company: { type: Type.STRING },
        location: { type: Type.STRING },
        pathway: { type: Type.ARRAY, items: { type: Type.STRING } },
        advice: { type: Type.STRING },
        skidmoreConnection: { type: Type.STRING },
        linkedInUrl: { type: Type.STRING }
      },
      required: ["name", "classYear", "major", "currentRole", "company", "location", "pathway", "advice", "skidmoreConnection", "linkedInUrl"]
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  return JSON.parse(response.text || "[]") as AlumniProfile[];
};

export const analyzeResume = async (
  profile: UserProfile,
  fileBase64?: string,
  mimeType?: string,
  textContext?: string
): Promise<string> => {
  const parts: any[] = [];
  if (fileBase64 && mimeType) parts.push({ inlineData: { data: fileBase64, mimeType } });
  if (textContext) parts.push({ text: `Resume Text:\n${textContext}` });

  const prompt = `
    Analyze this resume for a ${profile.classYear} targeting ${profile.concentration} internships for Summer 2026.
    Provide 3 improvements for Skidmore CDC standards.
  `;
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: { systemInstruction: SYSTEM_INSTRUCTION_BASE },
  });

  return response.text || "Could not analyze resume.";
};

export const chatWithCoach = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    history: history,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE + " Keep answers concise. Focus on Late Nov 2025 context.",
    },
  });
  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};

export const searchIndustryTrends = async (query: string): Promise<{ text: string; sources: GroundingUrl[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find 2026 trends for: ${query}. Date: Nov 2025.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: GroundingUrl[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
    if (chunk.web?.uri) sources.push({ uri: chunk.web.uri, title: chunk.web.title });
  });

  return { text: response.text || "", sources };
};

export const findCompaniesInCity = async (industry: string, city: string): Promise<{ text: string; locations: MapLocation[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find ${industry} firms in ${city}.`,
    config: { tools: [{ googleMaps: {} }] },
  });
  return { text: response.text || "", locations: [] };
};

export const findInternshipOpportunities = async (profile: UserProfile): Promise<{ listings: JobListing[]; sources: GroundingUrl[] }> => {
  const isSenior = profile.classYear === 'Senior';
  const prompt = `
    Context: Late November 2025.
    User Profile: ${profile.classYear}, ${profile.concentration} major, Interests: ${profile.interests}, Cities: ${profile.preferredCities}.
    
    ${isSenior 
      ? "As a SENIOR, find BOTH active Summer 2026 Post-Grad Internships AND Entry-Level Full-Time Jobs (roles starting Summer 2026)." 
      : "Find active Summer 2026 Internship listings."
    }

    Find 8-10 active listings.
    Categories MUST be one of: Finance, Marketing, Management, Accounting, Analytics, Sales, HR, Consulting, or Other.
    Prioritize direct ATS links (Greenhouse, Lever, LinkedIn Direct).
    For "jobType", use "Internship" or "Full-time".
    For "daysAgo", use an integer representing how many days ago it was posted (0 for today, 1 for yesterday, etc.).

    Return as JSON list of JobListing objects.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        company: { type: Type.STRING },
        location: { type: Type.STRING },
        postedDate: { type: Type.STRING },
        daysAgo: { type: Type.INTEGER },
        url: { type: Type.STRING },
        source: { type: Type.STRING },
        category: { type: Type.STRING },
        description: { type: Type.STRING },
        jobType: { type: Type.STRING, enum: ["Internship", "Full-time"] },
      },
      required: ["title", "company", "location", "postedDate", "daysAgo", "url", "category", "jobType"],
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const sources: GroundingUrl[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
    if (chunk.web?.uri) sources.push({ uri: chunk.web.uri, title: chunk.web.title });
  });

  try {
    const listings = JSON.parse(response.text || "[]");
    return { listings, sources };
  } catch (e) {
    return { listings: [], sources };
  }
};

export const getQuickTip = async (topic: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: `One short unconventional tip for: ${topic}. Max 15 words.`,
  });
  return response.text || "Network early.";
};

/**
 * TTS implementation using gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say encouragingly as a college mentor: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm, helpful voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio returned from TTS");
  return base64Audio;
};
