let policies = [];

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

