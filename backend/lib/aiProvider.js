const axios = require("axios");

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const client = axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
    timeout: 60000,
  });
  return client;
};

const callOpenAIChat = async (messages, model = "gpt-4o-mini") => {
  const client = getOpenAIClient();
  if (!client) throw new Error("OPENAI_API_KEY not set");
  const resp = await client.post("/chat/completions", {
    model,
    messages,
    temperature: 0.3,
  });
  const content = resp.data.choices?.[0]?.message?.content || "";
  return content;
};

const extractProfileFromResume = async (resumeText) => {
  const prompt = [
    { role: "system", content: "You are a helpful assistant that extracts structured data from resumes. Return strict JSON." },
    { role: "user", content: `Resume:\n${resumeText}\n\nExtract fields: name, skills (array of strings), education (array of {institutionName, startYear, endYear}). If missing fields, use empty values. Return only JSON.` },
  ];
  const text = await callOpenAIChat(prompt);
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const data = JSON.parse(jsonStr);
    return {
      name: data.name || "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      education: Array.isArray(data.education) ? data.education : [],
    };
  } catch (e) {
    return { name: "", skills: [], education: [] };
  }
};

const generateSOP = async ({ jobTitle, companyName, userName, userSkills }) => {
  const prompt = [
    { role: "system", content: "You write concise, tailored SOPs for job applications. Keep to 120-180 words." },
    { role: "user", content: `Write an SOP for ${userName} applying to ${jobTitle} at ${companyName}. Skills: ${userSkills.join(", ")}.` },
  ];
  return await callOpenAIChat(prompt);
};

const jobSearchQueryFromPreferences = async (preferences) => {
  const prompt = [
    { role: "system", content: "Transform preferences into a boolean search query string for job titles and skills." },
    { role: "user", content: JSON.stringify(preferences) },
  ];
  return await callOpenAIChat(prompt);
};

const chatWithAssistant = async (history, message) => {
  const messages = [
    { role: "system", content: "You are a career assistant for a job portal. Be concise and specific." },
    ...history,
    { role: "user", content: message },
  ];
  return await callOpenAIChat(messages);
};

module.exports = {
  extractProfileFromResume,
  generateSOP,
  jobSearchQueryFromPreferences,
  chatWithAssistant,
};

