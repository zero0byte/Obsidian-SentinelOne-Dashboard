const express = require("express");
const app = express();
const PORT = 3040;

// Enable fetch in CommonJS
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Replace with your actual credentials
const API_KEY = "REDACTED";
const ORG_ID = "REDACTED";
const UID = "REDACTED"; // ✅ Required for JWT request (get it from https://app.limacharlie.io/profile)

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

// 🔐 Get or refresh JWT
async function getJwtToken() {
  const now = Math.floor(Date.now() / 1000);
  if (jwtToken && now < jwtExpiry - 60) return jwtToken;

  const res = await fetch(`https://jwt.limacharlie.io?uid=${UID}&secret=${API_KEY}`, {
    method: "GET",
    headers: {
      Authorization: `secret ${API_KEY}`,
    }
  });

  if (!res.ok) {
  const errText = await res.text();
  console.error("🔍 JWT error response:", errText);
  throw new Error(`Failed to get JWT: ${res.status}`);
}

  const data = await res.json();
  console.log("🔍 Raw JWT response:", data);
  jwtToken = data.jwt;
  jwtExpiry = now + 3600;

  console.log("🔐 New JWT acquired, expires at:", new Date(jwtExpiry * 1000).toISOString());
  return jwtToken;
}

// 🔁 Proxy LC API call with JWT
app.post("/lc", async (req, res) => {
  try {
    const endpoint = req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: "Missing 'endpoint'" });

    const jwt = "eyJraWQiOiJldS1jZW50cmFsLTEtcHJvZC0wIiwiYWxnIjoiRVMyNTYifQ.eyJzdWIiOiJzZXJ2aWNldXNlci00ZjhhYjcwZC1kODczLTQ2ODUtYTYxYS0wMzJhYzk5YzczZmJAbWdtdC0xNDI2My5zZW50aW5lbG9uZS5uZXQiLCJpc3MiOiJhdXRobi1ldS1jZW50cmFsLTEtcHJvZCIsImRlcGxveW1lbnRfaWQiOiIxNDI2MyIsInR5cGUiOiJ1c2VyIiwiZXhwIjoxNzQ3NjU1Njk0LCJpYXQiOjE3MzIwMTgyMTQsImp0aSI6ImI1ZWQ4NWQwLTk4NmUtNDQ2Mi05YWU2LWQyYjhlMTI2Y2RkYyJ9.-YTdZntMH80bMoFEcaJ62yqOKDIc_0Tw0VR4ZrJ2OLLCrbHXVQ-wW2OX69RG9bYOT6xzEHm8Emz3b5QYDfPpSw"
    const url = `https://euce1-ir.sentinelone.net/web/api/v2.1/agents?siteIds=1909531443089829534`;

    console.log(`➡️ Using Token to call: ${url}`);

    const lcRes = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: ""
      }
    });

    const contentType = lcRes.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await lcRes.text();
      console.error("⚠️ Non-JSON response:", text);
      return res.status(lcRes.status).send(text);
    }

    const data = await lcRes.json();
	console.log(data);
    res.status(lcRes.status).json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ JWT-enabled LC Proxy with UID running at http://localhost:${PORT}`);
});
