
# **SentinelOne Obsidian Dashboard**

This project provides an automated **Obsidian Dashboard** that integrates with the **SentinelOne** platform. It allows users to have a simple view of agents and detections. The dashboard is built using **Obsidian**, **Templater** plugin, and a **custom proxy** server that interfaces with the SentinelOne API.
## **Features**

- **Agent Dashboard**: Automatically fetches agent details (e.g., hostname, SID, external IP, last seen) and presents them in a markdown table.
- **Detection Tracking**: Displays security detections with categorised data for each agent. Fetches the latest detections via the SentinelOne API.
- **Platform Distribution Chart**: Visualises the distribution of agents by operating system (Windows, Linux, MacOS, etc.) in a pie chart format.
- **Individual Agent Notes**: Creates or updates a note for each agent, which includes detailed information, detections, and mitigation actions.
## **Requirements**

1. **Obsidian**: A knowledge management system to store and manage notes.
2. **Templater Plugin**: For creating and managing custom templates within Obsidian.
3. **JS Engine Plugin**. Required to run JS scripts and functions.
4. **Charts View Plugin**. Required to render charts.
5. **Node.js**: For running the custom proxy server.
6. **SentinelOne API Access**: A valid API key from SentinelOne.
## **Installation**

### **1. Clone the repository**

```bash
git clone https://github.com/yourusername/obsidian-sentinelone-dashboard.git
cd obsidian-sentinelone-dashboard
```
### **2. Install Dependencies**

This project requires several npm modules to interact with the sentinelone API, handle the proxy server, and manage asynchronous operations. To install the necessary modules:

```bash
npm install
```
### **3. Install Obsidian Plugins**

Ensure that the **Templater plugin** is installed in your Obsidian vault:

- **Templater**: This plugin allows for executing custom JavaScript and dynamic templates within Obsidian.
#### **3a. Configure Environment Variables**

Add your API Key, for sentinelone to the head of proxy.js.

```
// Replace with your actual credentials
const API_TOKEN = "REDACTED"; //Grab from S1
const SITE_ID = "REDACTED"; // Grab from your S1 console

// Also make sure you replace "https://euce1-ir.sentinelone.net/" with your IR/S1 console root throughout proxy.js
```

### **4. Set Up the Proxy Server**

The `proxy.js` file acts as a middleware to handle requests to the SentinelOne API. To run the server:

```bash
node proxy.js
```

This will start a proxy server on `localhost:3040`, which handles API requests to SentinelOne.

### **5. Set Up the Templates in Obsidian**

1. Open your **Obsidian vault**.
2. Create a new folder named **Templates**.
3. Place the template files (**`Agent Dashboard Template.md`**) in the **Templates** folder within your Obsidian vault. These templates define how the dashboard and individual agent notes will be rendered.

---
## **Usage**

### **Running the Dashboard**

1. Open **Obsidian** and navigate to your vault.
2. Create a new note or and call your **Agent Dashboard Template** template file using Templater to populate the dashboard
3. The dashboard will display:
   - A table of agents with their details (hostname, SID, IP, etc.).
   - A pie chart showing the distribution of agents by platform.
   - A table of detections for all agents within the last 24 hours (change the logic in getSentinelOneCharlieDashboard.js to override) .

### **Creating Individual Agent Notes**

Once the dashboard is populated, you can create individual notes for each agent. Each agent’s note will include:
- **Agent Information**: Hostname, SID, external IP, last seen, etc.

You can then add content as your investigation or hunt progresses. I've left this intentionally bare to allow you to make your own choices.

---
## **Proxy Server (`proxy.js`)**

The **proxy.js** file forwards requests from Obsidian to SentinelOne to retrieve information about agents, detections, and other relevant data. This is necessary to bypass CORS restrictions when fetching data directly from the SentinelOne API.

- **Endpoint `/s1 or s1/res or s1/res/agent`**: Handles all requests related to agent details and detections.
- **Authentication**: The proxy uses the SentinelOne **API Token** stored in the `proxy.js` file for authentication.


---
## **Folder Structure**

```
My-Obsidian-Vault/
│
├── Assets/                           # Any assets like images, files, etc.
│
├── Scripts/                           # Custom JavaScript files used for fetching and processing data
│   └── proxy.js                      # Proxy script for forwarding API calls to
└── /Scripts/getSentinelOneDashboard.js # Script to parse the data from S1 an the proxy script
├── Agents/                           # Folder where individual agent notes are saved
│   ├── <sid>.md                      # Each agent's note, named by SID
│   └── another-agent-sid.md          # Another agent's note
│
├── Templates/                        # Templater templates for creating dashboard or notes
│   ├── AgentDashboardTemplate.md      # Template for the agent dashboard with tables and charts
│
├── .obsidian/                        # Obsidian settings, plugins, etc.
│
└── README.md                         # Readme file for vault documentation
```

---
## **NPM Modules Used**

- **node-fetch**: For making HTTP requests to the SentinelOne API.
- **express**: For serving the proxy server.

Install these dependencies by running:

```bash
npm install node-fetch express
```

These modules help with API requests, environment configuration, and serving the local proxy server.

---

## **Contributing**

If you'd like to contribute to this project, feel free to open an issue or submit a pull request. Any improvements or feature additions are welcome!

---

## **License**

This project is licensed under the MIT License - use freely, attribute if useful. Stay safe, and keep it structured.
