const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text) {
  return text.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Curated high-quality activities for filling itinerary slots
const GENERIC_ACTIVITIES = {
  Morning: [
    { title: "Scenic Sunrise Stroll", description: "Enjoy a peaceful sunrise trail walk followed by a curated local breakfast and freshly-brewed regional coffee." },
    { title: "Resort Wellness Session", description: "Take part in a private morning yoga and meditation session, designed to rejuvenate your senses." },
    { title: "Scenic Valley Trail Walk", description: "Embark on an early morning guided walk along local scenic paths, surrounded by morning dew and mist." },
    { title: "Local Bakery & Coffee Trail", description: "Stroll through the local streets to visit a traditional artisanal bakery and taste warm regional pastries." },
    { title: "Heritage Walk & Tea Tasting", description: "Join a local guide for a historic walk through the neighborhood, ending with a premium tea tasting session." }
  ],
  Afternoon: [
    { title: "Artisanal Market & Crafts Tour", description: "Explore the local boutique markets and discover hand-crafted regional souvenirs and textiles." },
    { title: "Regional Culinary Tasting", description: "Indulge in a curated culinary tasting lunch featuring authentic, local recipes at a highly-rated restaurant." },
    { title: "Luxury Spa & Resort Relaxation", description: "Spend a quiet afternoon enjoying premium spa treatments and luxury amenities at your resort." },
    { title: "Art Gallery & Tea Lounge Visit", description: "Browse regional art showcases and spend the afternoon relaxing with fine books and tea." },
    { title: "Historic Neighborhood Tour", description: "Explore colonial architectures and historic streets, visiting local landmarks and scenic cafes." }
  ],
  Evening: [
    { title: "Sunset Lounge & Fine Dining", description: "Relax at a rooftop panoramic sunset lounge followed by an elegant fine dining experience featuring regional delicacies." },
    { title: "Cultural Heritage Performance", description: "Attend an exclusive evening showcase featuring traditional music, classical dance, and regional folklore." },
    { title: "Panoramic Viewpoint & Stargazing", description: "Visit a quiet, elevated viewpoint to capture the sunset, followed by a light dinner under the stars." },
    { title: "Traditional Fireplace Lounge", description: "Wind down by a cozy fireplace or outdoor fire-pit, sharing travel stories and enjoying local desserts." },
    { title: "Riverside Stroll & Dinner", description: "Take a tranquil evening stroll along the waterfront, culminating in dinner with a view of the city lights." }
  ]
};

async function runSeeder() {
  console.log("Reading CSV file...");
  const filePath = path.join(__dirname, 'Top Indian Places to Visit.csv');
  if (!fs.existsSync(filePath)) {
    console.error("CSV file not found at:", filePath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n');

  // Parse lines grouping by slug to prevent duplicates
  const cityData = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split keeping in mind simple comma separation
    const parts = line.split(',');
    if (parts.length < 16) continue;

    const zone = parts[1].trim();
    const state = parts[2].trim();
    const city = parts[3].trim();
    const name = parts[4].trim();
    const type = parts[5].trim();
    const estYear = parts[6].trim();
    const timeNeeded = parts[7].trim();
    const rating = parts[8].trim();
    const fee = parts[9].trim();
    const airport = parts[10].trim();
    const weeklyOff = parts[11].trim();
    const significance = parts[12].trim();
    const dslrAllowed = parts[13].trim();
    const reviewsCount = parts[14].trim();
    const bestTime = parts[15].trim();

    const slug = slugify(city);
    if (!slug) continue;

    if (!cityData[slug]) {
      // Capitalize first letter of City for title if it's all lowercase in CSV
      const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
      cityData[slug] = {
        slug,
        city: capitalizedCity,
        state,
        zone,
        places: []
      };
    }

    cityData[slug].places.push({
      name,
      type,
      estYear,
      timeNeeded,
      rating,
      fee,
      airport,
      weeklyOff,
      significance,
      dslrAllowed,
      reviewsCount,
      bestTime
    });
  }

  const cities = Object.values(cityData);
  console.log(`Parsed ${cities.length} unique slugified cities from the CSV.`);

  // Build destinations payload
  const destPayload = cities.map(c => {
    const placeNames = c.places.slice(0, 3).map(p => p.name).join(', ');
    const description = `Explore the beautiful city of ${c.city} in ${c.state} (${c.zone} India). Discover top-rated sights including ${placeNames}, and experience local culture, regional culinary wonders, and nature trails.`;
    return {
      slug: c.slug,
      title: c.city,
      country: 'India',
      cover_image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
      description
    };
  });

  console.log("Upserting destinations to database...");
  const { data: upsertedDests, error: destError } = await supabase
    .from('destinations')
    .upsert(destPayload, { onConflict: 'slug' })
    .select();

  if (destError) {
    console.error("Error upserting destinations:", destError);
    process.exit(1);
  }

  console.log(`Successfully upserted ${upsertedDests.length} destinations.`);

  // Create a map from slug to destination ID
  const destIdMap = {};
  upsertedDests.forEach(d => {
    destIdMap[d.slug] = d.id;
  });

  // Collect itineraries payload
  const itinPayload = [];

  for (const c of cities) {
    const destId = destIdMap[c.slug];
    if (!destId) continue;

    // Create 3-day and 5-day itineraries
    const durations = [3, 5];

    for (const duration of durations) {
      let placeIdx = 0;
      const totalSlots = duration * 3; // 3 slots per day (Morning, Afternoon, Evening)
      let orderIdx = 0;

      for (let day = 1; day <= duration; day++) {
        const times = ['Morning', 'Afternoon', 'Evening'];
        for (const time of times) {
          let title = '';
          let desc = '';

          // If we have a CSV place for this city, use it
          if (placeIdx < c.places.length) {
            const p = c.places[placeIdx];
            title = p.name;
            desc = `${p.type} landmark. Significance: ${p.significance}. Best time to visit: ${p.bestTime}. Time needed: ${p.timeNeeded} hrs. Entrance Fee: ${p.fee} INR. Rating: ${p.rating} / 5.`;
            placeIdx++;
          } else {
            // Fill with curated generic activity
            const list = GENERIC_ACTIVITIES[time];
            const activity = list[orderIdx % list.length];
            title = activity.title;
            desc = activity.description;
          }

          itinPayload.push({
            destination_id: destId,
            duration_days: duration,
            day_number: day,
            time_label: `Day ${day} - ${time}`,
            title,
            description: desc,
            order_index: orderIdx++
          });
        }
      }
    }
  }

  console.log(`Deleting existing itineraries for the modified destinations...`);
  const destIds = Object.values(destIdMap);
  
  // Batch delete itineraries to avoid duplicating on re-runs
  const { error: deleteError } = await supabase
    .from('itineraries')
    .delete()
    .in('destination_id', destIds);

  if (deleteError) {
    console.error("Error deleting old itineraries:", deleteError);
    process.exit(1);
  }

  console.log(`Inserting ${itinPayload.length} itineraries in chunks of 500...`);
  
  // Supabase has bulk insert limits, so we batch inserts in sizes of 500
  const chunkSize = 500;
  for (let i = 0; i < itinPayload.length; i += chunkSize) {
    const chunk = itinPayload.slice(i, i + chunkSize);
    const { error: itinError } = await supabase
      .from('itineraries')
      .insert(chunk);

    if (itinError) {
      console.error(`Error inserting itineraries chunk at index ${i}:`, itinError);
      process.exit(1);
    }
  }

  console.log("Seeding completed successfully!");
}

runSeeder().catch(err => {
  console.error("Unhandled error during seeding:", err);
  process.exit(1);
});
