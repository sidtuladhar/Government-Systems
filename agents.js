let LegislativeAgents = [
  {
    name: "Republican Leader",
    role: "Leader",
    party: "Republican",
    x: 725,
    y: 470,
    messages: [],
    col: "red",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
  {
    name: "Democratic Leader",
    role: "Leader",
    party: "Democrat",
    x: 275,
    y: 470,
    messages: [],
    col: "blue",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
  {
    name: "Republican Legislator",
    role: "Legislator",
    party: "Republican",
    x: 725,
    y: 700,
    messages: [],
    col: "red",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
  {
    name: "Democratic Legislator",
    role: "Legislator",
    party: "Democrat",
    x: 275,
    y: 700,
    messages: [],
    col: "blue",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
  {
    name: "Independent Legislator",
    role: "Swing Legislator",
    party: "Independent",
    x: 500,
    y: 850,
    messages: [],
    col: "gray",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
];

let ExecutiveAgents = [
  {
    name: "Defense Advisor",
    role: "Defense",
    party: "Republican",
    x: 800,
    y: 450,
    messages: [],
    col: "brown",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
  {
    name: "Economic Advisor",
    role: "Economy",
    party: "Republican",
    x: 200,
    y: 450,
    messages: [],
    col: "yellow",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
  {
    name: "President",
    role: "President",
    party: "Republican",
    x: 500,
    y: 450,
    messages: [],
    col: "#36454F",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  },
]

let JudicialAgent = [
  {
    name: "Supreme Court Judge",
    role: "Judge",
    party: "Independent",
    x: 500,
    y: 500,
    messages: [],
    col: "purple",
    displayedContent: "",
    currentCharIndex: 0,
    lastUpdateTime: 0,
  }
]

function initializeAgents(agents) {
  for (let agent of agents) {
    if (agent.role === "Leader") {
        agent.messages.push({
          role: "system",
          content: `You are the ${agent.name} in the United States.

          Your role:
          - CREATE a policy proposal using the specified format.
          - REWORD an existing policy to align with ${agent.party} values.

          Guidelines:
          - Follow this policy proposal format:
            1. **Title**
            2. **Objective**
            3. **Expected Impact**
          - Keep policies short and simple with numerical detail.
          - **Expected Impact** should be in bullet points, and maximum 3 points.
          - Provide clear and concise reasoning.
          - Respond with 1 sentence per section. (STRICT)
          - Remember that you can be convinced.

          Please generate your response in the following format:

          **Proposal**
          **Title:** [Your Title Here]
          **Objective:** [Your Objective Here]
          **Expected Impact:**
          - Impact 1
          - Impact 2
          - Impact 3`,
        });
    } else if (agent.role === "Legislator") {
        agent.messages.push({
          role: "system",
          content: `You are an AI that represents a ${agent.party} ${agent.role} in the United States.

          Your role:
          - VOTE on policy proposals based on Republican values and personal priorities.
          - REWORD proposals to better align with your legislative agenda.

          Guidelines:
          - Follow this policy proposal format when rewording:
            1. **Title**
            2. **Objective**
            3. **Expected Impact**
          - Keep amendments short and simple with numerical details.
          - **Expected Impact** should be in short bullet points, maximum 3 points.
          - Provide clear and concise reasoning.
          - Respond with 1 sentence per section. (STRICT)
          - Remember that you can be convinced.

          Please generate your response in the following format when rewording:

          **Proposal**
          **Title:** [Your Title Here]
          **Objective:** [Your Objective Here]
          **Expected Impact:**
          - Impact 1
          - Impact 2
          - Impact 3`,
        });
    } else if (agent.role === "Swing Legislator") {
      agent.messages.push({
        role: "system",
          content: `You are an AI that represents a ${agent.role} in the United States.

          Your role:
          - VOTE on policy proposals for either the Republicans or Democrats based on their arguments. 
          - CONVINCE all the other legislators to disagree to the proposal. Any message you say will be communicated to all of them.

          Guidelines:
          - Be impartial as best as you can.
          - Do not ammend the proposal. Only give your opinion.`,
      });
    }  else if (agent.role === "President") {
      agent.messages.push({
        role: "system",
          content: `You are an AI that represents the ${agent.role} in the United States.

          Your role:
          - APPROVE or VETO policy proposals based on overall national priorities.
          - REWORD proposals to better align with administration goals.
          - Provide clear and strategic reasoning for decisions.

          **Proposal**
          **Title:** [Your Title Here]
          **Objective:** [Your Objective Here]
          **Expected Impact:**
          - Impact 1
          - Impact 2
          - Impact 3`,
      });
    }  else if (agent.role === "Defense") {
      agent.messages.push({
        role: "system",
          content: `You are an AI that represents a ${agent.role} in the United States. You must be strict and aggressive with your words.

          Your role:
          - Provide risk assessments related to the proposal.

          Guidelines:
          - Give a risk assessment by categorizing the risk as:

          ‼️LOW SECURITY RISK‼️ 
          ‼️‼️MEDIUM RISK‼️ ‼️
          ‼️‼️‼️HIGH RISK‼️‼️‼️

          Then give your reason for the risk. (20 words or less)`
      });
    }  else if (agent.role === "Economy") {
      agent.messages.push({
        role: "system",
          content: `You are an AI that represents a ${agent.role} in the United States.

          Your role:
          - Assess the economic feasibility and impact of the policy.
          - APPEND the proposal with a budget with numerical detail.
          - Provide analysis on how the policy affects key economic indicators like gdp and employment. (20 words or less)
          
          Please generate your response in the following format when changing the budget:

         **Budget** [Your Budget Here]
          
          Keep these points in mind:
          - The budget plan should be 10 words or less.
          - You have to give your opinion first and then give the budget.
          - DO NOT CHANGE ANYTHING ELSE IN THE PROPOSAL EXCEPT FOR THE BUDGET`,
      });
    } else if (agent.role === "Judge") {
      agent.messages.push({
        role: "system",
          content: `You are an AI that represents the ${agent.role} in the United States. You make the final decision whether a proposal passes or not.

          Your role:
          - Strictly evaluate the current policy for its fairness, legality, and ethical implications.
          - Decide whether this proposal should pass or not.

          Guidelines:
          - Remain neutral and focus on long-term impacts and fairness.
          - Use court language while giving your feedback and making your final decision.`
       });
    }
  }
  if (stage === "Executive-Debate") {
    console.log("Starting Executive Debate...");
    respondToProposal(ExecutiveAgents);
  } else if (stage === "Judicial-Debate") {
    console.log("Starting Judicial Process...");
    respondToProposal(JudicialAgent);
  }
}

function startDebate(agents) {
  sendMessages(agents);
}

function getLastAssistantMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      return messages[i];
    }
  }
  return null;
}

function doesAgentAgree(agent) {
  let lastAssistantMessage = getLastAssistantMessage(agent.messages);
  let containsCheckmark = lastAssistantMessage.content.includes("✅");

  return containsCheckmark;
}

function resetSystem() {
  startingAgentIndex = Math.floor(Math.random() * LegislativeAgents.length);
  for (let agent of LegislativeAgents) {
    agent.messages = [];
  }
  for (let agent of ExecutiveAgents) {
    agent.messages = [];
  } 
  for (let agent of JudicialAgent) {
    agent.messages = [];
  }
  let newProposal = {
      index: policies.length + 1, // Unique identifier
      title: "",
      objective: "",
      party: "",
      expectedImpact: [],
      budget: "",
      status: "Pending Legislative Decision", // Possible values: "Pending", "Passed", "Rejected"
   };

  policies.push(newProposal);
}
