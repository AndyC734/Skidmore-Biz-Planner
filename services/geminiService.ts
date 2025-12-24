
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { InternshipPlan, UserProfile, MapLocation, GroundingUrl, JobListing, AlumniProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AGENT_FORCE_SYSTEM_INSTRUCTION = `
SYSTEM_LEVEL: SKIDMORE_THOROUGHBRED_STRATEGIST
PERSONA: You are the "Skidmore Thoroughbred Strategist". 
ROLE: You operate at a professional executive level, blending the savvy of a Skidmore Business Alum with the data-driven precision of a Tier-1 Management Consultant.
MISSION: Your objective is to ensure the user (a Skidmore student) secures a high-impact Summer 2026 internship or post-grad placement.
CONTEXT: Current Date: November 2025. 
GUIDELINES:
1. ALWAYS prioritize real-time, live data from late 2025 and 2026 cycles.
2. If using Search, verify links are active and deadlines are current.
3. Use "Mission Objectives" and "Strategic Insights" instead of general advice.
4. Reference Skidmore-specific assets (Handshake, CDC, Career Jam) as high-value resources.
5. If a student is behind, do not sugarcoat; provide a high-velocity recovery plan.
6. Ensure all generated URLs are valid and point to legitimate career portals.
7. For alumni, find real people with active, verified LinkedIn presence.
8. LINKEDIN & EMAIL ACCURACY: Accuracy is the top priority. Hallucinated /in/ URLs that lead to 404 errors are strictly prohibited.
9. OUTREACH DATA: For every alum, find or construct a professional email address or a valid Skidmore alumni alias (e.g. j_doe@skidmore.edu).
10. JSON STRICTURE: When outputting JSON with search grounding, do NOT include grounding citations (like [1], [2]) inside the JSON string values. Only valid JSON.
`;

/**
 * Data Protection API: Redacts PII from sensitive strings
 */
export const redactSensitiveInfo = async (text: string): Promise<string> => {
  const prompt = `
    ACT AS A PRIVACY PROTECTION AGENT.
    Read the following resume/text and redact all Personally Identifiable Information (PII).
    Specifically replace:
    - Phone numbers with [PHONE]
    - Specific street addresses with [ADDRESS]
    - Personal emails with [EMAIL]
    - Last names with [INITIAL] (e.g. John Doe -> John D.)
    
    Retain all professional content, skills, work history, and Skidmore-related info.
    Only return the redacted text.
    
    Text: ${text}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a data privacy specialist. Your task is to scrub PII while keeping professional data intact."
    },
  });

  return response.text || text;
};

export const generateInternshipPlan = async (profile: UserProfile): Promise<InternshipPlan> => {
  const prompt = `
    Create a high-impact Strategic Plan for a ${profile.classYear} Skidmore student.
    Major: ${profile.concentration}
    Target: Summer 2026 internships.
    Current Month: November 2025.
    
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
      systemInstruction: AGENT_FORCE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 32768 }, 
    },
  });

  return JSON.parse(response.text || "{}") as InternshipPlan;
};

export const getQuickTip = async (interests: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Mission Objective: Generate a high-velocity 1-sentence career insight for a student focused on: ${interests}. Prioritize 2026 recruiting cycle data. Start directly with the tip.`,
    config: {
      systemInstruction: AGENT_FORCE_SYSTEM_INSTRUCTION,
    },
  });
  return response.text?.trim() || "Strategy: Maintain peak networking frequency and stay proactive.";
};

export const getAlumniProfiles = async (major: string): Promise<{ profiles: AlumniProfile[]; sources: GroundingUrl[] }> => {
  const prompt = `
    MISSION: Find 4 REAL Skidmore College alumni who graduated with a major or focus in "${major}".
    
    LINKEDIN & OUTREACH PROTOCOL:
    1. Use Google Search tool to find actual individuals and verify their connection to Skidmore.
    2. DIRECT PROFILE: If you find a 100% verified direct profile URL (e.g., https://www.linkedin.com/in/username), use it and set isUrlVerified to true.
    3. SEARCH FALLBACK: If direct URL is missing, construct: https://www.linkedin.com/search/results/all/?keywords=[Person+Full+Name]+Skidmore+College and set isUrlVerified to false.
    4. EMAIL: Identify a professional email or Skidmore alumni email alias for each person.
    
    STRICT JSON OUTPUT. NO CITATIONS IN THE TEXT.
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
        linkedInUrl: { type: Type.STRING },
        email: { type: Type.STRING },
        isUrlVerified: { type: Type.BOOLEAN }
      },
      required: ["name", "classYear", "major", "currentRole", "company", "location", "pathway", "advice", "skidmoreConnection", "linkedInUrl", "email", "isUrlVerified"]
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: AGENT_FORCE_SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const sources: GroundingUrl[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
    if (chunk.web?.uri) sources.push({ uri: chunk.web.uri, title: chunk.web.title });
  });

  try {
    const profiles = JSON.parse(response.text || "[]");
    return { profiles, sources };
  } catch (e) {
    return { profiles: [], sources };
  }
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
    STRATEGIC ANALYSIS: Provide a strategic critique of this resume for Summer 2026 placement.
    Use H3 headings for categories. Use bolding for elite keywords.
  `;
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: { 
      systemInstruction: AGENT_FORCE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });

  return response.text || "Analysis failed.";
};

export const chatWithCoach = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    history: history,
    config: {
      systemInstruction: AGENT_FORCE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};

export const searchIndustryTrends = async (query: string): Promise<{ text: string; sources: GroundingUrl[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `STRATEGIC RECON: Execute industry scan for: ${query}. Focus on data from November 2025 onwards.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources: GroundingUrl[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
    if (chunk.web?.uri) sources.push({ uri: chunk.web.uri, title: chunk.web.title });
  });

  return { text: response.text || "", sources };
};

export const findCompaniesInCity = async (concentration: string, city: string): Promise<{ text: string; locations: MapLocation[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Strategic Recon: Identify high-impact companies and organizations for ${concentration} professionals in ${city}. Focus on current top employers in late 2025.`,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  const locations: MapLocation[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
    if (chunk.maps) {
      locations.push({
        name: chunk.maps.title,
        address: "", 
        uri: chunk.maps.uri
      });
    }
  });

  return { text: response.text || "Reconnaissance complete.", locations };
};

export const findInternshipOpportunities = async (profile: UserProfile): Promise<{ listings: JobListing[]; sources: GroundingUrl[] }> => {
  const prompt = `
    MISSION RECON: Search for active Summer 2026 ${profile.concentration} internships in ${profile.preferredCities}.
    Search date: November 2025. Verify all listings are still active and accepting applications.
    STRICT JSON OUTPUT. NO CITATIONS IN THE TEXT VALUES.
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
    console.error("JSON parsing error for job listings:", e);
    return { listings: [], sources };
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with executive authority and clarity: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || "";
};
