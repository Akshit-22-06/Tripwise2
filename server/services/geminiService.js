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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

const generateItineraryFromRealData = async ({
  destinationName,
  destinationCity,
  startingLocation,
  durationDays = 3,
  travelers = 1,
  budget = 15000,
  travelStyle = 'Standard',
  transportation = null,
  accommodation = null,
  places = [],
}) => {
  const days = Math.min(Math.max(parseInt(durationDays) || 3, 1), 14);
  const attractionNames = (places || [])
    .map((p) => p.name || p.address)
    .filter((n) => n && !n.includes('Point of Interest'));
  const hotelName = accommodation?.name || 'Local Hotel Accommodation';
  const transportSummary = transportation
    ? `${transportation.type || 'Transit'}: ${transportation.title || 'Direct route'} (${transportation.duration || 'convenient timing'})`
    : 'Local transit';

  const fallbackRealItinerary = () => {
    const dayPlans = [];
    const dailyCost = Math.round(budget / days);

    for (let i = 1; i <= days; i++) {
      let morning = '';
      let afternoon = '';
      let evening = '';

      if (i === 1) {
        morning = `Depart from ${startingLocation} and arrive in ${destinationName} via ${transportSummary}.`;
        afternoon = `Check in at ${hotelName}. ${attractionNames[0] ? `Take a walking tour to ${attractionNames[0]}.` : `Explore central ${destinationCity} and settle in.`}`;
        evening = `Dinner at an authentic local restaurant in ${destinationCity} and evening orientation stroll.`;
      } else if (i === days) {
        const lastAttraction =
          attractionNames[(i - 1) % (attractionNames.length || 1)] ||
          'local bazaar';
        morning = `Enjoy breakfast at ${hotelName}. Visit ${lastAttraction} for sightseeing and souvenir shopping.`;
        afternoon = `Check out from ${hotelName}. Final leisurely lunch in ${destinationCity}.`;
        evening = `Commence return journey back to ${startingLocation}. Safe travels!`;
      } else {
        const att1 =
          attractionNames[(i * 2 - 2) % (attractionNames.length || 1)] ||
          `Heritage landmark in ${destinationCity}`;
        const att2 =
          attractionNames[(i * 2 - 1) % (attractionNames.length || 1)] ||
          `Scenic nature viewpoint in ${destinationCity}`;
        morning = `Morning excursion to ${att1}. Experience local culture and sights.`;
        afternoon = `Guided tour of ${att2}. Photo opportunities and local cuisine lunch.`;
        evening = `Relaxed evening promenade through ${destinationCity} town center and sunset view.`;
      }

      dayPlans.push({
        dayNumber: i,
        theme: `Day ${i}: ${i === 1 ? 'Arrival & Discovery' : i === days ? 'Farewell & Departure' : `${travelStyle} Exploration`}`,
        morning,
        afternoon,
        evening,
        dailyEstimatedCost: dailyCost,
      });
    }

    return {
      tripTitle: `${days}-Day ${travelStyle} Trip to ${destinationName}`,
      summary: `A carefully curated ${days}-day itinerary for ${travelers} traveler(s) exploring ${destinationName} from ${startingLocation}.`,
      dayPlans,
    };
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return fallbackRealItinerary();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are an expert travel planner for TripWise.
You are given REAL VERIFIED travel data:
- Destination: ${destinationName} (${destinationCity})
- Starting Point: ${startingLocation}
- Duration: ${days} Days
- Travelers: ${travelers}
- Recommended Transportation: ${transportSummary}
- Selected Accommodation: ${hotelName}
- Verified Attractions (You MUST USE these exact real places in the daily schedule): ${attractionNames.slice(0, 10).join(', ') || 'Local heritage landmarks'}

Strict Rules:
1. You must NOT invent fake flight numbers, fake train numbers, fake hotel prices, or fictional attractions.
2. Day 1 MUST start with arrival from ${startingLocation} and check-in at ${hotelName}.
3. The final day MUST conclude with check-out from ${hotelName} and return journey to ${startingLocation}.
4. Intervening days MUST feature the verified real attractions listed above for morning, afternoon, and evening activities.
5. Return strictly valid raw JSON without markdown formatting.
JSON Schema:
{
  "tripTitle": "string",
  "summary": "string",
  "dayPlans": [
    {
      "dayNumber": number,
      "theme": "string",
      "morning": "string",
      "afternoon": "string",
      "evening": "string",
      "dailyEstimatedCost": number
    }
  ]
}`;

    const userPrompt = `Create a ${days}-day ${travelStyle} travel plan for ${travelers} traveler(s) visiting ${destinationName}. Budget: ₹${budget}.`;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const responseText = result.response.text();
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn(
      'Gemini AI planning unavailable, using real data fallback scheduler:',
      err.message
    );
    return fallbackRealItinerary();
  }
};

module.exports = {
  generateLiveItinerary,
  generateItineraryFromRealData,
};
