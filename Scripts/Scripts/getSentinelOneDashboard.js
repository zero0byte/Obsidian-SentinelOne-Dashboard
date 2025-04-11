module.exports = async (tp) => {

	
  const formatDateWithMicroseconds = (date) => {
    const isoString = date.toISOString();
    return isoString.replace('Z', '000Z');
  };
  const now = new Date();
  const date24HoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const formatted = formatDateWithMicroseconds(date24HoursAgo);

  const generateChartsviewBlock = (chartLabels, chartData, chartType = "Pie", serieName = "Enterprise") => {
    let block = "```chartsview\n";
    block += "#-----------------#\n";
    block += "#- chart type    -#\n";
    block += "#-----------------#\n";
    block += `type: ${chartType}\n\n`;

    block += "#-----------------#\n";
    block += "#- chart data    -#\n";
    block += "#-----------------#\n";
    block += "data:\n";

    chartLabels.forEach((label, i) => {
      block += `  - label: "${label}"\n`;
      block += `    value: ${chartData[i]}\n`;
      block += `    serie: "${serieName}"\n`;
    });

    block += "\n#-----------------#\n";
    block += "#- chart options -#\n";
    block += "#-----------------#\n";
    block += "options:\n";
    block += `  "": serie\n`;
    block += `  colorField: label\n`;
    block += `  angleField: value\n`;
    block += "```\n";

    return block;
  };

  const generateDetectionsTable = (detects) => {
    if (!detects || detects.length === 0) {
      return "No detections found.";
    }

    let table = "| Detection ID | Agent | Classification | Timestamp | Threat Name |\n";
    table += "|--------------|----------|----------|-----------|------|\n";

    detects.forEach(d => {
      const genTime = new Date(d.threatInfo.createdAt).toLocaleString();
      table += `| ${d.id} | ${d.agentRealtimeInfo.agentComputerName} | ${d.threatInfo.classification} | ${genTime} | ${d.threatInfo.threatName} |\n`;
    });

    return table;
  };
  
const generateAgentTable = (detects) => {
  if (!detects || detects.length === 0) {
    return "No activities found.";
  }

  let table = "| Activity ID | Description | Secondary Description | Timestamp |\n";
  table += "|-------------|-------------|------------------------|-----------|\n";

  detects.forEach(d => {
    const id = d.activityUuid || "?";
    const primary = (d.primaryDescription || "?").replace(/\n/g, " ");
    const secondary = (d.secondaryDescription || "?").replace(/\n/g, " ");
    const timestamp = d.createdAt || "?";

    table += `| ${id} | ${primary} | ${secondary} | ${timestamp} |\n`;
  });

  return table;
};


  const res = await fetch("http://localhost:3040/s1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: "none" })
  });

  if (!res.ok) {
    new Notice("❌ Failed to fetch agent list.");
    return;
  }

  const sensors = await res.json();
  const file = app.workspace.getActiveFile();
  if (!file) {
    new Notice("❌ No active file found.");
    return;
  }

  await app.vault.append(file, "## Agents\n\n");

  const rows = [];
  const platformCount = {};

  for (const s of sensors.data) {
    const sid = s.uuid;
    const hostname = s.computerName || "?";
    const ip = s.lastIpToMgmt || "?";
    const lastSeen = s.lastActiveDate || "?";
    const version = s.agentVersion || "?";
    const platformName = s.osName || "?";
	const agentId_ = s.id || "?";
    platformCount[platformName] = platformCount[platformName] ? platformCount[platformName] + 1 : 1;
	
	const agentRes = await fetch("http://localhost:3040/s1/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: `web/api/v2.1/activities`,
	  agentId: agentId_,
      updatedAt__gte: formatted
    })
  });
	await new Promise(resolve => setTimeout(resolve, 2000));
	
	
	
	let agentTable = "";

  if (agentRes.ok) {
	const agentData = await agentRes.json();
	console.log(agentData.data)
    agentTable = generateAgentTable(agentData.data);
  } else {
    agentTable = "❌ Failed to fetch activities.";
  }

  
	
    const agentNoteContent = [
      `# Agent ${hostname}`,
      `- **SID**: ${sid}`,
      `- **External IP**: ${ip}`,
      `- **Last Seen**: ${lastSeen}`,
      `- **OS**: ${platformName}`,
      `- **Version**: ${version}`,
      `- **Status**: ${s.status || "Unknown"}`,
	  "\n",
	  "### Latest Activities (last 24 Hours)\n\n" + agentTable + "\n\n"
    ].join("\n");
	
    const path = `Agents/${sid}.md`;
    const fileExists = app.vault.getAbstractFileByPath(path);

    if (fileExists) {
      await app.vault.modify(fileExists, agentNoteContent);
	  //await app.vault.append(fileExists, "### Latest Detections (last 24 Hours)\n\n" + agentTable + "\n\n");
    } else {
      await app.vault.create(path, agentNoteContent);
	  //await app.vault.append(path, "### Latest Detections (last 24 Hours)\n\n" + agentTable + "\n\n");
    }

    const agentNoteLink = `[View ${hostname}](${path})`;
    rows.push([hostname, sid, ip, lastSeen, agentNoteLink]);
  }

  const tableMarkdown = [
    "### Agent List\n",
    "| Hostname | SID | External IP | Last Seen | Action |",
    "|----------|-----|-------------|-----------|--------|",
    ...rows.map(r => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} |`)
  ].join("\n");

  await app.vault.append(file, tableMarkdown + "\n\n");

  const chartLabels = Object.keys(platformCount);
  const chartData = Object.values(platformCount);
  const chartBlock = generateChartsviewBlock(chartLabels, chartData);

  await app.vault.append(file, chartBlock + "\n\n");

  new Notice("✅ Agent dashboard generated with platform pie chart.");

  

  const detectionsRes = await fetch("http://localhost:3040/s1/res", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: `web/api/v2.1/threats`,
      updatedAt__gte: formatted
    })
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  let detectionsTable = "";

  if (detectionsRes.ok) {
    const detectionsData = await detectionsRes.json();
    detectionsTable = generateDetectionsTable(detectionsData.data);
  } else {
    detectionsTable = "❌ Failed to fetch detections.";
  }

  await app.vault.append(file, "### Latest Detections (last 24 Hours)\n\n" + detectionsTable + "\n\n");
};
