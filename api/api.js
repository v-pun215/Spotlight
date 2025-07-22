const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow frontend (5500) to access backend
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

const FSQ_SERVICE_KEY = process.env.FSQ_SERVICE_KEY;

const fsqHeaders = {
  Authorization: `Bearer ${FSQ_SERVICE_KEY}` ,
  "X-Places-API-Version": "2025-06-17",
  Accept: "application/json",
};

async function getFoursquarePhoto(fsq_id) {
  try {
    const url =`https://places-api.foursquare.com/places/${fsq_id}/photos`;

    const res = await axios.get(url, { headers: fsqHeaders });

    const photo = res.data[0];
    return photo ? `${photo.prefix}original${photo.suffix}` : null;
  } catch {

    return null;
  }
}

async function getWikiData(title) {
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await axios.get(wikiUrl);

    return {
      desc: res.data.extract || "No description available.",
      img: res.data.originalimage?.source || res.data.thumbnail?.source || null,
    };
  } catch {
    return {
      desc: "Suprise!",
      img: null,
    };
  }
}


async function formatPlace(place) {
  const { fsq_place_id, name, latitude, longitude } = place;

  const [wikiData, fsqImage] = await Promise.all([
    getWikiData(name),
    getFoursquarePhoto(fsq_place_id),
  ]);

  const img = fsqImage || wikiData.img || "";

  return {
    name,
    desc: wikiData.desc,

    coordinates: { lat: latitude, lng: longitude },
    img,

    rating: (Math.random() * 2 + 3).toFixed(1),
    visit: Math.floor(Math.random() * 1000),
  };
}

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://places-api.foursquare.com/places/search", {
      headers: fsqHeaders,
      params: {
        ll: "28.6139,77.2090", // Delhi

        categories: "16000",
        limit: 30,
      },
    });

    const raw = response.data.results;
    const enriched = await Promise.all(raw.map(formatPlace));
    const sorted = enriched.sort((a, b) => a.visit - b.visit).slice(0, 10);

    res.json(sorted);
  } catch (err) {
    console.error("FSQ API err => ", err.response?.data || err.message);
    res.status(500).json({ error: "Error fetching places" });
  }
});

app.get("/query", async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Missing name param" });

  try {
    const response = await axios.get("https://places-api.foursquare.com/places/search", {
      headers: fsqHeaders,
      params: {
        query: name,
        ll: "28.6139,77.2090",
        limit: 1,
      },
    });

    const place = response.data.results[0];
    if (!place) return res.status(404).json({ error: "Place not found" });

    const formatted = await formatPlace(place);
    res.json(formatted);
  } catch (err) {
    console.error("FSQ Query Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Error fetching place" });
  }
});

app.listen(PORT, () => {
  console.log(`Srvr running at http://localhost:${PORT}`);
});
