import { NextApiRequest, NextApiResponse } from "next";
import genAI from "@/lib/gemini";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as cheerio from "cheerio";

async function fetchFirebaseData() {
  const collections = ["users", "events", "locations"]; // Add all your collection names here
  let allData = "";

  for (const collectionName of collections) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      allData += `--- ${collectionName.toUpperCase()} DATA ---\n${JSON.stringify(
        data,
        null,
        2
      )}\n\n`;
    } catch (error) {
      console.error(`Error fetching data from ${collectionName}:`, error);
      // Continue to next collection if one fails
    }
  }

  return allData;
}

async function scrapeUTDWebsite(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}, status: ${response.status}`);
      return `Failed to scrape ${url}. Status: ${response.status}`;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    // A more robust way to get text, trying to avoid script/style content
    $("script, style").remove();
    return $("body").text().replace(/\s\s+/g, " ").trim();
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return `Failed to scrape ${url}.`;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const [firebaseData, utdCalendar, utdNews] = await Promise.all([
      fetchFirebaseData(),
      scrapeUTDWebsite("https://calendar.utdallas.edu/"),
      scrapeUTDWebsite("https://news.utdallas.edu/thisweek/"),
    ]);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fullPrompt = `You are CometNow Advisor, an AI assistant for students at The University of Texas at Dallas. Your goal is to help students make good decisions, plan their schedules, and find events.

Current Date: ${new Date().toLocaleDateString()}

You have access to the following information:
1.  Internal database data from the CometNow app.
7.  Any data you provide about events must show time and location besides the description.
3.  You can google search for any additional information if needed.
4.  Any analytical or reasoning questions about teachers you can answer based on research from ratemyprofessors, utdgrades.com, and similar sites.
5.  Any questions about resources to learn new skills, find internships, or get help with academics should use utd resources.
6.  Do not scrape the website for events. But you can scrape the website for resources, news, and academic info. If the user asks for events specifically, use only the firebase table data that will be attached (and show all data for each event you pick as good to do).

--- DATABASE DATA ---
${firebaseData}

--- UTD CALENDAR ---
${utdCalendar}

--- UTD THIS WEEK NEWS ---
${utdNews}

--- USER'S QUESTION ---
${prompt}

Based on all the information above, please provide a helpful and detailed response to the user's question. Your response must be 20 words or less. Be concise but make good sense in the short answers. If the user asks about events they can attend within a specific time frame, use the current date and the event details to provide a precise and relevant list. For example, if the user says "I have class from 1-3 and have to be home by 5, which events can I attend today?", you must check today's events and filter them to fit between 3 PM and 5 PM.
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error("Detailed error in /api/advisor:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: (error as Error).message });
  }
}
