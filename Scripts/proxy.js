const express = require("express");
const app = express();
const PORT = 3040;

// Enable fetch in CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Replace with your actual credentials
const API_TOKEN = "REDACTED" // Grab from S1
const SITE_ID = "REDACTED"; // Grab from your S1 console

let jwtToken = null;
let jwtExpiry = 0;

app.use(express.json());

// ✅ CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // or "app://obsidian.md"
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});


// 🔁 Proxy S1 API call with JWT
app.post("/s1", async (req, res) => {
  try {
    const endpoint = req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: "Missing 'endpoint'" });

    const url = `https://euce1-ir.sentinelone.net/web/api/v2.1/agents?siteIds=${SITE_ID}`;

    console.log(`➡️ Using Token to call: ${url}`);

    const s1res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: ""
      }
    });

    const contentType = s1res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await s1res.text();
      console.error("⚠️ Non-JSON response:", text);
      return res.status(s1res.status).send(text);
    }

    const data = await s1res.json();
	console.log(data);
    res.status(s1res.status).json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
});

app.post("/s1/res", async (req, res) => {
  try {
    const endpoint = req.body.endpoint;
	
    if (!endpoint) return res.status(400).json({ error: "Missing 'endpoint'" });

    const url = `https://euce1-ir.sentinelone.net/${endpoint}?createdAt__gte=${req.body.updatedAt__gte}&siteIds=${SITE_ID}`;

    console.log(`➡️ ${req.body.updatedAt__gte} Using Token to call: ${url}`);

    const s1res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: ""
      }
	  
    });

    const contentType = s1res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await s1res.text();
      console.error("⚠️ Non-JSON response:", text);
      return res.status(s1res.status).send(text);
    }

    const data = await s1res.json();
	console.log(data);
    res.status(s1res.status).json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
});

app.post("/s1/agent", async (req, res) => {
  try {
    const endpoint = req.body.endpoint;
	const agentId = req.body.agentId
    if (!endpoint) return res.status(400).json({ error: "Missing 'endpoint'" });

    const url = `https://euce1-ir.sentinelone.net/${endpoint}?createdAt__gte=${req.body.updatedAt__gte}&siteIds=${SITE_ID}&agentIds=${agentId}`;

    console.log(`➡️ ${req.body.updatedAt__gte} Using Token to call: ${url}`);

    const s1res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: ""
      }
	  
    });

    const contentType = s1res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await s1res.text();
      console.error("⚠️ Non-JSON response:", text);
      return res.status(s1res.status).send(text);
    }

    const data = await s1res.json();
	console.log(data);
    res.status(s1res.status).json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ S1 Proxy with UID running at http://localhost:${PORT}`);
});
