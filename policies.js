let policies = [
  {
    index: 1,
    title: "Tax Relief for Middle-Class Families",
    objective: "To reduce the tax burden on middle-class families by increasing the standard deduction to $25,000 and maintaining a flat tax rate.",
    party: "Party A",
    expectedImpact: [
      "Increase in disposable income for over 75 million households.",
      "Boost consumer spending by approximately 15% within the first year, providing greater support for local businesses.",
      "Generate around 500,000 new jobs, particularly in sustainable sectors to promote long-term growth."
    ],
    budget: "$1.2B",
    status: "Passed"
  }
];

let proposal = {
  index: 0,
  title: "",
  objective: "",
  party: "",
  expectedImpact: [],
  budget: "",
  status: "Pending Legislative Decision", // Possible values: "Pending Legislative Decision", "Pending Executive Decision", "Pending Judicial Decision", "Passed", "Rejected"
};

function parseProposal(proposalText, agent) {
  if (typeof proposalText !== 'string') {
    console.error('Error: proposalText must be a string.');
    return;
  }

  const proposalMarker = '**Proposal**';
  const markerIndex = proposalText.indexOf(proposalMarker);
  const budgetRegex = /\*\*Budget\*\*\s*([^\n]+)/;
  const budgetIndex = proposalText.match(budgetRegex);

  if (markerIndex === -1) {
    if (budgetIndex && budgetIndex[1]) {
      const budget = budgetIndex[1].trim();
      let prevProposal = policies[policies.length - 1];
      let newProposal = {
      index: policies.length, // Unique identifier
      title: prevProposal.title,
      objective: prevProposal.objective,
      party: prevProposal.party,
      expectedImpact: prevProposal.expectedImpact,
      budget: budget,
      status: "Pending Executive Decision"
      };
      policies.pop();
      policies.push(newProposal);
    } else {
    console.warn("Warning: No '**Proposal**' section found in the text.");
    } 
    return;
  }

  // 4. Extract the text after '**Proposal**'
  const extractedText = proposalText.substring(markerIndex + proposalMarker.length).trim();

  // 5. Split the extracted text into lines
  const lines = extractedText.split('\n');

  // 6. Initialize a new proposal object
  let newProposal = {
      index: policies.length + 1, // Unique identifier
      title: "",
      objective: "",
      party: agent.name,
      expectedImpact: [],
      budget: "",
      status: "Pending Legislative Decision", // Possible values: "Pending", "Passed", "Rejected"
   };

  if (agent.role !== "Legislator" && agent.role !== "Leader" && agent.role !== "Swing Legislator") {
    newProposal.party = policies[policies.length - 1].party;
  }

  // 7. Define regex patterns for headers (with and without colon)
  const titleRegex = /^\*\*Title:?\*\*\s*(.*)/i;
  const objectiveRegex = /^\*\*Objective:?\*\*\s*(.*)/i;
  const expectedImpactRegex = /^\*\*Expected Impact:?\*\*/i;

  let currentSection = null;

  // 8. Iterate through each line to extract information
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    let titleMatch = line.match(titleRegex);
    if (titleMatch) {
      newProposal.title = titleMatch[1].trim();
      currentSection = 'Title';
      continue;
    }

    let objectiveMatch = line.match(objectiveRegex);
    if (objectiveMatch) {
      newProposal.objective = objectiveMatch[1].trim();
      currentSection = 'Objective';
      continue;
    }
    
    let budgetMatch = line.match(budgetRegex);
    if (budgetMatch) {
      newProposal.budget = budgetMatch[1].trim();
      currentSection = 'Budget';
      continue;
    }

    if (expectedImpactRegex.test(line)) {
      currentSection = 'ExpectedImpact';
      continue;
    }

    // Extract data based on the current section
    if (currentSection === 'Title') {
      if (line !== '') {
        newProposal.title += ' ' + line;
      }
    } else if (currentSection === 'Objective') {
      if (line !== '') {
        newProposal.objective += ' ' + line;
      }
    } else if (currentSection === 'ExpectedImpact') {
      if (line.startsWith('-')) {
        let impact = line.replace('-', '').trim();
        newProposal.expectedImpact.push(impact);
      }
    } else if (currentSection === 'Budget') {
      if (line !== '') {
        newProposal.objective += ' ' + line;
      }
    }
  } 

  // 9. Validation: Ensure essential fields are present
  if (!newProposal.title) {
    console.warn("Warning: Proposal is missing a Title.");
  }
  if (!newProposal.objective) {
    console.warn("Warning: Proposal is missing an Objective.");
  }
  if (newProposal.expectedImpact.length === 0) {
    console.warn("Warning: Proposal is missing Expected Impact points.");
  }

  
  if (newProposal.title && newProposal.objective && newProposal.expectedImpact.length > 0) {
    // 10. Optional: Remove the last proposal if it's still pending (to avoid duplicates)
    if (policies.length > 0 && policies[policies.length - 1].status !== "Rejected" && policies[policies.length - 1].status  !== "Passed") {
      policies.pop();
      newProposal.index -= 1;
    }

    policies.push(newProposal);

  } else {
    console.warn("Proposal parsing incomplete. Please ensure all sections are present.");
  }
}

function drawRecentPassedPolicies(policies) {
  let passedPolicies = policies.filter(p => p.status === "Passed");
  passedPolicies = passedPolicies.slice(-3);
  textFont("Arial");
  textAlign(LEFT, TOP);
  noStroke();

  let x = 50; // Starting X position
  let y = 50; // Starting Y position
  let cardWidth = 400;
  let spacing = 20;

  for (let i = 0; i < passedPolicies.length; i++) {
    let policy = passedPolicies[i];
    
    textStyle(NORMAL);

    let titleHeight = textHeight(policy.title, cardWidth - 20);
    let objectiveHeight = textHeight(policy.objective, cardWidth - 20);
    let impactsHeight = policy.expectedImpact.reduce(
      (acc, impact) => acc + textHeight(impact, cardWidth - 40),
      0
    );
    let cardHeight = 100 + titleHeight + objectiveHeight + impactsHeight;

    // Draw card with shadow
    noStroke();
    fill(200, 200, 200, 150); // Shadow effect
    rect(x + 5, y + 5, cardWidth, cardHeight, 10); // Shadow offset
    fill(255); // Card background
    stroke(150); // Light gray border
    strokeWeight(1);
    rect(x, y, cardWidth, cardHeight, 10); // Card with rounded corners

    // Header with title
    fill("#2A4D69"); // Dark blue
    noStroke();
    rect(x, y, cardWidth, 40, 10, 10, 0, 0); // Header background
    fill(255); // White text
    textSize(18);
    textStyle(BOLD);
    drawWrappedText(policy.title, x + 10, y + 10, cardWidth - 20); // Wrapped title/
   
    fill(0);
    textSize(16);
    textStyle(BOLD);
    text("Objective:", x + 10, y + 50);
    textStyle(ITALIC);
    drawWrappedText(policy.objective, x + 120, y + 50, cardWidth - 130); // Wrapped text

    textStyle(BOLD);
    text("Expected Impacts:", x + 10, y + 80 + objectiveHeight);
    textStyle(NORMAL);
    let impactsY = y + 100 + objectiveHeight;
    for (let j = 0; j < policy.expectedImpact.length; j++) {
      impactsY += drawWrappedText(
        `- ${policy.expectedImpact[j]}`,
        x + 20,
        impactsY,
        cardWidth - 40
      );
    }
    y += cardHeight + spacing;
  }

  // Title for the display
  fill(0);
  textSize(20);
  textStyle(BOLDITALIC);
  textAlign(LEFT);
  text("Recent Passed Policies", x + 80, 20);
}

function textHeight(txt, wrapWidth) {
  textSize(14);
  let words = txt.split(" ");
  let line = "";
  let lineHeight = 20; // Approximate line height
  let totalHeight = 0;

  for (let word of words) {
    if (textWidth(line + word + " ") > wrapWidth) {
      totalHeight += lineHeight;
      line = word + " ";
    } else {
      line += word + " ";
    }
  }
  if (line.length > 0) totalHeight += lineHeight; // Add the final line
  return totalHeight;
}

// Function to draw wrapped text
function drawWrappedText(txt, x, y, wrapWidth) {
  textSize(14);
  let words = txt.split(" ");
  let line = "";
  let lineHeight = 20; // Approximate line height
  let startY = y;

  for (let word of words) {
    if (textWidth(line + word + " ") > wrapWidth) {
      text(line, x, startY);
      startY += lineHeight;
      line = word + " ";
    } else {
      line += word + " ";
    }
  }
  if (line.length > 0) {
    text(line, x, startY); // Draw the final line
    startY += lineHeight;
  }
  return startY - y; // Return the total height used
}
