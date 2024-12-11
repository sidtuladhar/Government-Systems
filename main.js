let openai_api_proxy = config.API_URL;
let currentTurn = 0;
let maxTurns = 2;
let stage = "Legislative-Debate"; // Legislative-Vote, Executive-Debate, Executive-Vote, Judicial-Amend, Judicial-Vote
let roleImages = {};
let startingAgentIndex = Math.floor(Math.random() * LegislativeAgents.length);
let legislative_img, executive_img, judicial_img;
let legislative_graphic, executive_graphic, judicial_graphic;

function preload() {
  roleImages["Leader"] = loadImage("images/leader.svg");
  roleImages["Legislator"] = loadImage("images/legislator.svg");
  roleImages["Swing Legislator"] = loadImage("images/legislator.svg");
  roleImages["Economy"] = loadImage("images/economy.svg");
  roleImages["President"] = loadImage("images/president.svg");
  roleImages["Defense"] = loadImage("images/defense.svg");
  roleImages["Judge"] = loadImage("images/scale.svg");
  policyImage = loadImage("images/policy.svg");

  legislative_img = loadImage("images/legislative.png");
  executive_img = loadImage("images/executive.png");
  judicial_img = loadImage("images/judicial.png");
}

function setup() {
  createCanvas(2000, 1200);
  policyPos = createVector(
    LegislativeAgents[(LegislativeAgents[0].x, LegislativeAgents[0].y)],
  );

  initializeAgents(LegislativeAgents);
  startDebate(LegislativeAgents[0]);
  console.log("Starting...");
  drawProposal();
  legislative_graphic = createGraphics(
    legislative_img.width,
    legislative_img.height,
  );
  executive_graphic = createGraphics(executive_img.width, executive_img.height);
  judicial_graphic = createGraphics(judicial_img.width, judicial_img.height);

  legislative_graphic.noStroke();
  executive_graphic.noStroke();
  judicial_graphic.noStroke();

  legislative_graphic.fill(255);
  executive_graphic.fill(255);
  judicial_graphic.fill(255);

  legislative_graphic.rect(
    0,
    0,
    legislative_img.width,
    legislative_img.height,
    25,
  );
  executive_graphic.rect(0, 0, executive_img.width, executive_img.height, 25);
  judicial_graphic.rect(0, 0, judicial_img.width, judicial_img.height, 25);
}

function draw() {
  background(curBackground);
  drawRecentPassedPolicies(policies);
  textFont(curFont);
  drawProposal();

  if (stage === "Legislative-Debate" || stage === "Legislative-Vote") {
    drawAgents(LegislativeAgents);
    drawBanner(legislative_img, legislative_graphic);
  } else if (stage === "Executive-Debate" || stage === "Executive-Vote") {
    drawAgents(ExecutiveAgents);
    drawBanner(executive_img, executive_graphic);
  } else if (stage === "Judicial-Debate" || stage === "Judicial-Vote") {
    drawAgents(JudicialAgent);
    drawBanner(judicial_img, judicial_graphic);
  }

  imageMode(CENTER);
  image(policyImage, policyPos.x + 25, policyPos.y - 10, 40, 40);

  if (isAnimating) {
    animatePolicy();
  }

  if (updateBackground) {
    let transitionComplete = updateBackground();
    if (transitionComplete) {
      updateBackground = null; // Stop calling once transition is done
      if (stage === "Judicial-Debate") {
        curBackground = "#4169E1";
      } else if (stage === "Executive-Debate") {
        curBackground = "#228B22";
        drawBanner(executive_img);
      } else if (stage === "Legislative-Debate") {
        curBackground = "#A9A9A9";
        drawBanner(judicial_img);
      }
    }
  }
}

function respondToProposal(agents) {
  // console.log(currentTurn, maxTurns * agents.length);
  if (currentTurn >= maxTurns * agents.length) {
    if (stage === "Legislative-Debate") {
      console.log("Changing Stage");
      stage = "Legislative-Vote";
      currentTurn = 0;
      maxTurns = 1;
      respondToProposal(agents);
    } else if (stage === "Legislative-Vote") {
      let agree = 0;
      for (let agent of agents) {
        if (doesAgentAgree(agent)) {
          agree++;
        }
      }
      if (agree >= 3) {
        updateBackground = smoothBackgroundTo("#A9A9A9", "#228B22", 2000);
        policies[policies.length - 1].status = "Pending Executive Decision";
        stage = "Executive-Debate";
        currentTurn = 0;
        maxTurns = 1;
        policyPos = createVector(
          ExecutiveAgents[(ExecutiveAgents[0].x, ExecutiveAgents[0].y)],
        );
        initializeAgents(ExecutiveAgents);
      } else {
        policies[policies.length - 1].status = "Rejected";
        stage = "Legislative-Debate";
        currentTurn = 0;
        maxTurns = 2;
        resetSystem();
        initializeAgents(LegislativeAgents);
        startDebate(LegislativeAgents[0]);
      }
    } else if (stage === "Executive-Debate") {
      let decision = doesAgentAgree(
        ExecutiveAgents[ExecutiveAgents.length - 1],
      );
      if (decision) {
        console.log("Last Stage");
        updateBackground = smoothBackgroundTo("#228B22", "#4169E1", 2000);
        policies[policies.length - 1].status = "Pending Judicial Decision";
        stage = "Judicial-Debate";
        currentTurn = 0;
        maxTurns = 1;
        policyPos = createVector(
          JudicialAgent[(JudicialAgent[0].x, JudicialAgent[0].y)],
        );
        initializeAgents(JudicialAgent);
      } else {
        updateBackground = smoothBackgroundTo("#228B22", "#A9A9A9", 2000);
        policies[policies.length - 1].status = "Rejected";
        stage = "Legislative-Debate";
        currentTurn = 0;
        maxTurns = 2;
        resetSystem();
        initializeAgents(LegislativeAgents);
        startDebate(LegislativeAgents[0]);
      }
    } else if (stage === "Judicial-Debate") {
      let decision = doesAgentAgree(JudicialAgent[0]);
      if (decision) {
        console.log("Done");
        policies[policies.length - 1].status = "Passed";
      } else {
        console.log("Failed");
      }
      updateBackground = smoothBackgroundTo("#4169E1", "#A9A9A9", 2000);
      stage = "Legislative-Debate";
      currentTurn = 0;
      maxTurns = 2;
      resetSystem();
      initializeAgents(LegislativeAgents);
      startDebate(LegislativeAgents[0]);
    }
    return;
  }
  let agentIndex;
  if (stage === "Legislative-Debate") {
    agentIndex = (startingAgentIndex + currentTurn) % agents.length;
  } else {
    agentIndex = currentTurn % agents.length;
  }
  let agent = agents[agentIndex];
  // console.log(currentTurn, maxTurns, agents.length, agent);
  const budgetInfo = policies[policies.length - 1].budget
    ? `${policies[policies.length - 1].budget}`
    : "Not specified";

  if (policies.length === 0) {
    console.log("NO POLICY");
  } else if (stage === "Legislative-Debate") {
    agent.messages.push({
      role: "user",
      content: `You represent ${agent.party} ${agent.name}. This is the current proposal at hand:
          
      **Title**
      ${policies[policies.length - 1].title}

      **Objective**
      ${policies[policies.length - 1].objective}

      **Impact**
      ${policies[policies.length - 1].expectedImpact[0]}
      ${policies[policies.length - 1].expectedImpact[1]}
      ${policies[policies.length - 1].expectedImpact[2]}

      Give an opinion (less than 20 words) about the proposal and anything else you'd like to say.

      Then if you want to make amends to it, give numerical details and start with **Proposal**. If you agree with most of it, DO NOT AMEND.`,
    });
  } else if (stage === "Legislative-Vote") {
    agent.messages.push({
      role: "user",
      content: `You represent ${agent.part} ${agent.name}. This is the current proposal at hand:
          
      **Title**
      ${policies[policies.length - 1].title}

      **Objective**
      ${policies[policies.length - 1].objective}

      **Impact**
      ${policies[policies.length - 1].expectedImpact[0]}
      ${policies[policies.length - 1].expectedImpact[1]}
      ${policies[policies.length - 1].expectedImpact[2]}
      
      We are now at a voting stage. If you agree to the current proposal, say "I vote for the proposal. ✅"  If you do not, say "I vote against the proposal. ❌"`,
    });
  } else if (stage === "Executive-Debate") {
    if (agent.role === "President") {
      agent.messages.push({
        role: "user",
        content: `You represent ${agent.name}. We are currently in the Executive Committee. This is the current proposal at hand:
              
          **Title**
          ${policies[policies.length - 1].title}

          **Objective**
          ${policies[policies.length - 1].objective}

          **Impact**
          ${policies[policies.length - 1].expectedImpact[0]}
          ${policies[policies.length - 1].expectedImpact[1]}
          ${policies[policies.length - 1].expectedImpact[2]}
          
          **Budget**
          ${budgetInfo}
          
          According to your role, give your opinion on the proposal and be specific (20 words or less). After your opinion respond with:
           
          'I believe this proposal will benefit our country, I approve this proposal ✅' or 'This proposal is not suitable. I veto this proposal ❌'`,
      });
    } else {
      agent.messages.push({
        role: "user",
        content: `You represent ${agent.name}. We are currently in the Executive Committee. This is the current proposal at hand:
              
          **Title**
          ${policies[policies.length - 1].title}

          **Objective**
          ${policies[policies.length - 1].objective}

          **Impact**
          ${policies[policies.length - 1].expectedImpact[0]}
          ${policies[policies.length - 1].expectedImpact[1]}
          ${policies[policies.length - 1].expectedImpact[2]}
          
          **Budget**
          ${budgetInfo}
          
          Do what you have to do according to your role.`,
      });
    }
  } else if (stage === "Judicial-Debate") {
    agent.messages.push({
      role: "user",
      content: `You represent ${agent.name}. This is the current proposal at hand:
              
            **Title**
            ${policies[policies.length - 1].title}

            **Objective**
            ${policies[policies.length - 1].objective}

            **Impact**
            ${policies[policies.length - 1].expectedImpact[0]}
            ${policies[policies.length - 1].expectedImpact[1]}
            ${policies[policies.length - 1].expectedImpact[2]}

            **Budget**
            ${budgetInfo}

            According to your role, give your opinion on the proposal first and be specific (30 words or less). After giving your opinion respond with:
            
            'This proposal is CONSTITUTIONAL and aligns with the principles of fairness and legality. ✅' or 'This proposal is UNCONSTITUTIONAL. Our court system must do better. ❌'`,
    });
  }
  sendMessages(agent);
  currentTurn++;
}

function sendMessages(agent) {
  //  console.log("Sending: " + agent.messages.slice(-1)[0].content);
  let params = {
    model: "gpt-4o-mini",
    messages: agent.messages,
    temperature: 0.8,
  };
  requestOAI("POST", "/v1/chat/completions", params, (results, params) =>
    gotResults(results, agent),
  );
}

function gotResults(results, agent) {
  let resultMessage = results.choices[0].message.content.trim();
  console.log(`Received from ${agent.name}: ${resultMessage}`);
  targetPos = createVector(agent.x, agent.y);
  isAnimating = true;
  animationProgress = 0;

  parseProposal(resultMessage, agent);

  agent.messages.push({
    role: "assistant",
    content: resultMessage,
  });
  agent.displayedContent = "";
  agent.currentCharIndex = 0;
  agent.lastUpdateTime = millis();

  if (stage === "Legislative-Debate" || stage === "Legislative-Vote") {
    setTimeout(() => {
      for (let otherAgent of LegislativeAgents) {
        if (otherAgent !== agent) {
          otherAgent.messages.push({
            role: "system",
            content: `${agent.name} said: "${resultMessage}"`,
          });
        }
      }
      respondToProposal(LegislativeAgents);
    }, 2000);
  } else if (stage === "Executive-Debate") {
    setTimeout(() => {
      for (let otherAgent of ExecutiveAgents) {
        if (otherAgent !== agent) {
          otherAgent.messages.push({
            role: "system",
            content: `${agent.name} said: "${resultMessage}"`,
          });
        }
      }
      respondToProposal(ExecutiveAgents);
    }, 7000);
  } else if (stage === "Judicial-Debate") {
    setTimeout(() => {
      respondToProposal(JudicialAgent);
    }, 12000);
  }
}
