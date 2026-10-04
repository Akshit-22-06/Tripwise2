const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Intelligent local itinerary generator fallback.
 * Guarantees that the Trip Planner ALWAYS works smoothly during
 * offline development, student project demonstrations, or if Google Gemini rate limits / fails.
 */
const generateLocalItinerary = ({ destination, durationDays, budgetTier, travelStyle, preferences = [] }) => {
  const dailyBase = budgetTier === 'Luxury' ? 12000 : budgetTier === 'Mid-range' ? 5500 : 2500;
  const days = Math.min(Math.max(parseInt(durationDays) || 3, 1), 14);

  const styleThemes = {
    historical: [
      { morning: 'Visit the Ancient City Citadel & Grand Palace', afternoon: 'Guided walkthrough of the Heritage & History Museum', evening: 'Stroll through the Historic Quarter and evening light show' },
      { morning: 'Explore centuries-old Temples and Architectural Relics', afternoon: 'Traditional Craft Workshop and Tea Ceremony', evening: 'Dinner at an authentic heritage dining hall' },
      { morning: 'Panoramic fortress viewpoint and morning meditation walk', afternoon: 'Archaeological excavations tour and ancient library', evening: 'Sunset river promenade and folk music performance' },
    ],
    adventure: [
      { morning: 'Early morning mountain ridge trek and sunrise vista', afternoon: 'Thrilling white-water river rafting or canyon descent', evening: 'Campfire barbecue and stargazing gathering' },
      { morning: 'Mountain bike expedition across scenic forest trails', afternoon: 'Rock climbing and zipline canopy adventure', evening: 'Local bistro dinner and trail story sharing' },
      { morning: 'Kayaking excursion along the outer lake inlets', afternoon: 'Off-road jeep safari to secluded wilderness lookouts', evening: 'Rustic wilderness lodge feast' },
    ],
    beach: [
      { morning: 'Morning beach stroll and ocean paddleboarding', afternoon: 'Reef snorkeling and tropical catamaran sail', evening: 'Seaside sunset dinner with fresh catch of the day' },
      { morning: 'Coastal cliff hike and hidden cove swimming', afternoon: 'Relaxation at beachside wellness pavilion', evening: 'Beachfront fire lounge and live tropical acoustic music' },
      { morning: 'Island-hopping boat tour to crystal lagoons', afternoon: 'Scuba diving with certified marine guides', evening: 'Seaside promenade dining and craft market' },
    ],
    urban: [
      { morning: 'Architectural walking tour of the central boulevard', afternoon: 'Contemporary Art Gallery and designer boutique shopping', evening: 'Skyline rooftop cocktails and chef-curated tasting dinner' },
      { morning: 'Morning espresso and artisan bakery breakfast', afternoon: 'High-speed transit ride to modern science & tech center', evening: 'Live theatrical show or classical symphony performance' },
      { morning: 'Bustling morning farmer and spice market exploration', afternoon: 'Urban park cycling and modern sculpture garden', evening: 'Gourmet street food crawl through the neon district' },
    ],
    nature: [
      { morning: 'Botanical reserve walk and bird watching expedition', afternoon: 'Picnic beside the cascading forest waterfalls', evening: 'Lakeside cabin dinner surrounded by twilight woods' },
      { morning: 'Alpine meadow hike past crystal glacial streams', afternoon: 'Nature photography workshop in the national park', evening: 'Warm mountain fondue and herbal tea lounge' },
      { morning: 'Scenic cable car ride to high mountain summit', afternoon: 'Forest canopy tree-top suspension bridge walk', evening: 'Quiet sunset terrace reflection with local organic cuisine' },
    ],
  };

  const selectedThemes = styleThemes[travelStyle.toLowerCase()] || styleThemes.historical;

  const dailySchedule = [];
  let cumulativeCost = 0;

  for (let i = 1; i <= days; i++) {
    const dayTheme = selectedThemes[(i - 1) % selectedThemes.length];
    const morningCost = Math.round(dailyBase * 0.25);
    const afternoonCost = Math.round(dailyBase * 0.40);
    const eveningCost = Math.round(dailyBase * 0.35);
    const dailyTotal = morningCost + afternoonCost + eveningCost;
    cumulativeCost += dailyTotal;

    dailySchedule.push({
      dayNumber: i,
      theme: `Day ${i}: ${travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)} Highlights in ${destination}`,
      morning: {
        activity: dayTheme.morning,
        estimatedCost: morningCost,
        location: `${destination} Central`,
      },
      afternoon: {
        activity: dayTheme.afternoon,
        estimatedCost: afternoonCost,
        location: `${destination} Landmark District`,
      },
      evening: {
        activity: dayTheme.evening,
        estimatedCost: eveningCost,
        location: `${destination} Evening Promenade`,
      },
      dailyTotal,
    });
  }

  return {
    tripTitle: `${days}-Day ${budgetTier} ${travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)} Exploration in ${destination}`,
    destination,
    totalEstimatedCost: cumulativeCost,
    dailySchedule,
    budgetBreakdown: {
      lodging: Math.round(cumulativeCost * 0.45),
      transport: Math.round(cumulativeCost * 0.20),
      food: Math.round(cumulativeCost * 0.20),
      activities: Math.round(cumulativeCost * 0.15),
    },
  };
};

const generateLiveItinerary = async ({ destination, durationDays, budgetTier, travelStyle, preferences = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key or placeholder key, use the local generator directly
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return generateLocalItinerary({ destination, durationDays, budgetTier, travelStyle, preferences });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are a travel itinerary planner. Generate a structured day-wise itinerary in strictly valid JSON format.
Do NOT output markdown code fences (like \`\`\`json). The response must be raw parseable JSON.
Schema:
{
  "tripTitle": "string",
  "destination": "string",
  "totalEstimatedCost": number,
  "dailySchedule": [
    {
      "dayNumber": number,
      "theme": "string",
      "morning": { "activity": "string", "estimatedCost": number, "location": "string" },
      "afternoon": { "activity": "string", "estimatedCost": number, "location": "string" },
      "evening": { "activity": "string", "estimatedCost": number, "location": "string" },
      "dailyTotal": number
    }
  ],
  "budgetBreakdown": {
    "lodging": number,
    "transport": number,
    "food": number,
    "activities": number
  }
}`;

    const userPrompt = `Generate a ${durationDays}-day travel itinerary for ${destination}.
Budget Tier: ${budgetTier}. Travel style: ${travelStyle}. Preferences: ${preferences.join(', ') || 'none'}.
Calculate realistic expenses in INR.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn('Gemini Live API unavailable, seamlessly falling back to curated itinerary generator:', err.message);
    return generateLocalItinerary({ destination, durationDays, budgetTier, travelStyle, preferences });
  }
};

module.exports = {
  generateLiveItinerary,
};
