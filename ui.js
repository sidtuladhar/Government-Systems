let policyPos, targetPos;
let policyImage; // Policy SVG image
let isAnimating = false; // Flag to control animation
let animationProgress = 0; 
let transitionStartTime = null;
let updateBackground = null;
let curBackground = '#A9A9A9';
let typingSpeed = 10;
let curFont = 'monospace';


function drawProposal() {
  // Check if there are any policies to display
  textFont('Arial');
  if (policies.length === 0) {
    return; // Nothing to draw
  }
  
  // Get the most recent proposal
  let latestProposal = policies[policies.length - 1];
  
  // Define positioning and dimensions
  let x = 50;
  let y = 50;
  let boxWidth = 850;
  let boxHeight = 250;
  
  // Draw a rectangle as the background for the proposal
  fill(240);
  stroke(0);
  if (latestProposal.budget) {
  rect(x, y, boxWidth, boxHeight + 25);
  } else {
  rect(x, y, boxWidth, boxHeight, 10);
  }
  
  // Set text properties
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  
  // Display Title
  textStyle(BOLD);
  text(`${latestProposal.title}`, x + 10, y + 15);
  
  // Display Objective
  textStyle(ITALIC);
  text(`Objective: ${latestProposal.objective}`, x + 10, y + 40, 800);
  
  textStyle(NORMAL);
  text(`Expected Impact:`, x + 10, y + 90);
  textSize(14);
  for (let i = 0; i < latestProposal.expectedImpact.length; i++) {
    text(`• ${latestProposal.expectedImpact[i]}`, x + 20, y + 120 + i * 20);
  }
  
  // Display Status
  textSize(14);
  fill(getStatusColor(latestProposal.status));
  text(`Status: ${latestProposal.status}`, x + 10, y + boxHeight - 50);
  
  // Display Party
  textSize(14);
  fill(getStatusColor(latestProposal.party));
  text(`Proposed By: ${latestProposal.party}`, x + 10, y + boxHeight - 30);

  if (latestProposal.budget) {
    textSize(14);
    text(`Budget: `, x + 10, y + boxHeight - 10);

    fill(255, 0, 0); // Red
    text(`${latestProposal.budget}`, x + 65, y + boxHeight - 10); // Adjust x for positioning
  }

  fill(100);
  textSize(12);
  text(`Proposal #${latestProposal.index}`, x + boxWidth - 100, y + boxHeight - 30);
  textFont(curFont);
}

// Helper function to determine color based on status
function getStatusColor(status) {
  if (status === "Passed") {
    return color(0, 255, 0); // Green
  } else if (status === "Rejected") {
    return color(255, 0, 0); // Red
  } else {
    return color(0); // Black for Pending or other statuses
  }
}

function drawAgents(agents) {
  for (let agent of agents) {
    fill(agent.col);

    if (stage == "Legislative-Debate" || stage === "Legislative-Vote") {
      ellipse(agent.x, agent.y, 70, 70);
      curFont = textFont('monospace');
    } else if (stage === "Executive-Debate"){
      ellipse(agent.x, agent.y, 100, 100);
      curFont = textFont('Times New Roman');
    } else {
      ellipse(agent.x, agent.y, 100, 100);
      curFont = textFont('serif');
    }

    let img = roleImages[agent.role];
    if (img) {
      imageMode(CENTER);
      image(img, agent.x, agent.y, 50, 50); // Adjust size as needed
    } else {
      // Fallback in case no image is found for the role
      fill(agent.col);
      ellipse(agent.x, agent.y, 50, 50);
    }

    // Draw agent name
    fill(0);
    textAlign(CENTER, CENTER);
    if (stage == "Legislative-Debate" || stage === "Legislative-Vote") {
      textSize(16);
      textStyle(BOLD);
      text(agent.name, agent.x, agent.y - 50);
    } else {
      textSize(18);
      textStyle(BOLD);
      text(agent.name, agent.x, agent.y - 65);
    }

    if (agent.messages.length > 0) {
      let lastAssistantMessage = getLastAssistantMessage(agent.messages);

      if (lastAssistantMessage) {
        // Extract the content before '**Proposal**' or '**Budget**'
        let contentBeforeProposal = extractContentBeforeMarker(lastAssistantMessage.content, '**Proposal**');
        let contentBeforeBudget = extractContentBeforeMarker(lastAssistantMessage.content, '**Budget**');
        let contentToDisplay;

        if (lastAssistantMessage.content.includes('**Proposal**')) {
          // Handle content before **Proposal** only if it exists
          contentToDisplay = contentBeforeProposal.length > 0
            ? contentBeforeProposal
            : ""; // Ensure we don't fall back to contentBeforeBudget
        } else if (lastAssistantMessage.content.includes('**Budget**')) {
          // Handle content before **Budget**
          contentToDisplay = contentBeforeBudget;
        } else {
          // Default to empty string if no markers are found
          contentToDisplay = lastAssistantMessage.content;
        }
        // If there's new content to display, reset typing variables
        if (agent.currentMessage !== contentToDisplay) {
          agent.displayedContent = "";
          agent.currentCharIndex = 0;
          agent.currentMessage = contentToDisplay;
          agent.lastUpdateTime = millis();
        }

        // Add characters based on typing speed
        if (millis() - agent.lastUpdateTime > typingSpeed) {
          if (agent.currentCharIndex < agent.currentMessage.length) {
            let nextChar =
              agent.currentMessage.charAt(agent.currentCharIndex) || "";
            agent.displayedContent += nextChar;
            agent.currentCharIndex++;
            agent.lastUpdateTime = millis();
          }
        }

        // Display the current portion of the message if there's valid content
        if (contentToDisplay && contentToDisplay.length > 0) {
          fill(0);
          textAlign(LEFT, TOP);
          if (stage === "Executive-Debate" || stage === "Judicial-Debate") {
            textSize(15);
            text(agent.displayedContent, agent.x - 75,agent.y + 55, 180, 250)
          } else {
            textSize(12);
            text(agent.displayedContent, agent.x - 80,agent.y + 55, 175, 250);
          }
        }
      }  
    }
  }
}

function animatePolicy() {
  if (animationProgress < 1) {

    if (stage === "Executive-Debate" || stage === "Judicial-Debate") {
    policyPos.x = lerp(policyPos.x, targetPos.x + 12, 0.1);
    policyPos.y = lerp(policyPos.y, targetPos.y - 5, 0.1);
    } else {
    policyPos.x = lerp(policyPos.x, targetPos.x, 0.1);
    policyPos.y = lerp(policyPos.y, targetPos.y, 0.1);
    }
    animationProgress += 0.02; // Adjust speed here
  } else {
    isAnimating = false;
    animationProgress = 0;
  }
}

function smoothBackgroundTo(startHex, endHex, duration) {
  let startColor = [
    parseInt(startHex.substring(1, 3), 16),
    parseInt(startHex.substring(3, 5), 16),
    parseInt(startHex.substring(5, 7), 16),
  ];
  let endColor = [
    parseInt(endHex.substring(1, 3), 16),
    parseInt(endHex.substring(3, 5), 16),
    parseInt(endHex.substring(5, 7), 16),
  ];

  transitionStartTime = millis(); // Set transition start time

  return function () {
    let elapsedTime = millis() - transitionStartTime;
    let t = min(1, elapsedTime / duration); // Clamp t between 0 and 1

    let currentColor = [
      lerp(startColor[0], endColor[0], t),
      lerp(startColor[1], endColor[1], t),
      lerp(startColor[2], endColor[2], t),
    ];

    background(currentColor[0], currentColor[1], currentColor[2]);

    // Return true if the transition is complete
    return t === 1;
  };
}

function extractContentBeforeMarker(message, marker) {
  const proposalMarker = marker; 
  const markerIndex = message.indexOf(proposalMarker);

  if (markerIndex === -1) {
    // '**Proposal**' not found, return the entire message
    return message.trim();
  } else if (markerIndex === 0) {
    // '**Proposal**' is at the start, return empty string
    return "";
  } else {
    // Return content before '**Proposal**'
    return message.substring(0, markerIndex).trim();
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is rounded up
  max = Math.floor(max); // Ensure max is rounded down
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
