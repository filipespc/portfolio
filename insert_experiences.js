const fs = require('fs');

// Read the experiences data
const rawData = fs.readFileSync('attached_assets/Pasted--Job-Title-Senior-Product-Manager-Start-and-End-dates-of-experience-Aug-2023--1750342951596_1750342951597.txt', 'utf8');
const experiences = JSON.parse(rawData);

// Function to convert date format from "Aug 2023 - Present" to "2023-08"
function convertDate(dateStr) {
  if (!dateStr || dateStr === "Not specified in the document.") return null;
  
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const [month, year] = dateStr.split(' ');
  return `${year}-${months[month]}`;
}

// Function to parse date range
function parseDateRange(dateRange) {
  const [start, end] = dateRange.split(' - ');
  const startDate = convertDate(start);
  const endDate = end === 'Present' ? null : convertDate(end);
  const isCurrentJob = end === 'Present';
  
  return { startDate, endDate, isCurrentJob };
}

// Function to format tools
function formatTools(tools) {
  if (!tools || tools === "Not specified in the document.") return [];
  if (typeof tools === 'string') return [];
  
  return tools.map(tool => JSON.stringify({
    name: tool.tool,
    usage: tool.description
  }));
}

// Convert experiences to the format expected by the API
const formattedExperiences = experiences.map(exp => {
  const { startDate, endDate, isCurrentJob } = parseDateRange(exp["Start and End dates of experience"]);
  
  return {
    jobTitle: exp["Job Title"],
    industry: exp.Industry,
    startDate,
    endDate,
    isCurrentJob,
    description: exp["Job description and main accomplishments"],
    accomplishments: exp["Job description and main accomplishments"], // Using same content for both
    tools: formatTools(exp["Main tools used"]),
    education: [] // No education data provided
  };
});

// Function to make authenticated request
async function makeRequest(url, method, data) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'connect.sid=s%3AjL8xZ9QK5vB2nF3mP7tR1wE4yU6iO0aS.ABC123' // Will be replaced with actual session
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Insert experiences
async function insertExperiences() {
  for (const exp of formattedExperiences) {
    try {
      console.log(`Inserting: ${exp.jobTitle}`);
      const result = await makeRequest('http://localhost:5000/api/admin/experiences', 'POST', exp);
      console.log(`✓ Added: ${exp.jobTitle}`);
    } catch (error) {
      console.error(`✗ Failed to add ${exp.jobTitle}:`, error.message);
    }
  }
}

console.log(`Found ${formattedExperiences.length} experiences to insert`);
console.log('Formatted experiences:', JSON.stringify(formattedExperiences.slice(0, 2), null, 2));