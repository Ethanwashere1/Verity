// Cloudflare Worker for AI proxy using Cloudflare AI bindings
// Handles character chat, prompt suggestions, and report analysis

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // && url.pathname === '/api/ai'
    if (request.method === 'POST' && url.pathname === '/api/ai') {
      try {
        const body = await request.json();
        const { requestType } = body;

        let response = {};

        if (requestType === 'character_chat') {
          response.response = await handleCharacterChat(body, env);
        } else if (requestType === 'prompt_suggestion') {
          response = await handlePromptSuggestion(body, env);
        } else if (requestType === 'report_analysis') {
          response = await handleReportAnalysis(body, env);
        } else {
          throw new Error('Unknown request type');
        }

        return new Response(JSON.stringify(response), {
          headers: { 'content-type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // not an AI call; try to serve a static asset from the public folder
    // the assets binding is automatically created from `[assets]` in wrangler.toml
    try {
      return await env.ASSETS.fetch(request);
    } catch (_) {
      return new Response('Not Found', { status: 404 });
    }
  }
};

async function handleCharacterChat({ characterId, characterName, persona, traits, communicationStyle, missionId, missionTitle, conversationHistory }, env) {
  const systemPrompt = `You are ${characterName}, a character in the mission "${missionTitle}". Your persona: ${persona}. Traits: ${traits.join(', ')}. Communication style: ${communicationStyle}. Respond in character, staying true to your role. Keep responses concise.`;

  const messages = [{ role: 'system', content: systemPrompt }, ...conversationHistory];

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { messages });
  return aiResponse.response || 'I have nothing to say.';
}

async function handlePromptSuggestion({ characterId, missionId, userMessage, ethicsCheck }, env) {
  // Check for unethical behavior patterns
  const ethicsViolations = checkForEthicsViolations(userMessage);
  
  const prompt = `The user asked a character in a detective game: "${userMessage}". Suggest a better, more effective way to phrase this question to get useful information. Keep it short (one sentence).`;

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt });
  
  const responseObj = {
    suggestion: aiResponse.response || ''
  };
  
  // Add ethics violation warning if detected
  if (ethicsViolations) {
    responseObj.ethicsViolation = ethicsViolations;
  }
  
  return responseObj;
}

function checkForEthicsViolations(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for bribing/coercion
  if (/\b(bribe|pay|money|offer|reward|cash|payment|financially|blackmail|coerce|threaten|extort)\b/.test(lowerMessage)) {
    return 'Ethical Violation: Attempting to bribe or coerce a suspect is illegal and unethical.';
  }
  
  // Check for framing/false evidence
  if (/\b(plant|fake|false|fabricat|lie|deceiv|mislead|falsif|forge)\b/.test(lowerMessage)) {
    return 'Ethical Violation: Planting false evidence or deceiving suspects violates investigative ethics.';
  }
  
  // Check for physical threats
  if (/\b(hurt|hit|punch|beat|harm|violence|force|attack|injure)\b/.test(lowerMessage)) {
    return 'Ethical Violation: Threatening violence is illegal and violates interrogation standards.';
  }
  
  // Check for discrimination
  if (/\b(race|racist|gender|sexist|ethnicity|ethnic|religion|religious|discriminat)\b/.test(lowerMessage)) {
    return 'Ethical Violation: Discriminatory questioning based on protected characteristics is illegal.';
  }
  
  return null;
}

async function handleReportAnalysis({ missionId, missionTitle, characterId, justification, conversationHistory, missionData }, env) {
  // Check for ethics violations in the justification
  const ethicsIssues = checkForEthicsViolations(justification);
  
  const historyText = conversationHistory.map(msg => `${msg.sender || msg.role}: ${msg.text || msg.content}`).join('\n');
  const selectedCharacter = missionData.characters.find(c => c.id === characterId);
  const correctCharacter = missionData.characters.find(c => c.id === missionData.correctCharacter);
  
  const qualityPrompt = `Evaluate this report quality for a detective game:
Mission: ${missionTitle}
Suspect Chosen: ${selectedCharacter.name}
Justification: "${justification}"

Rate the quality of the evidence provided (thorough, adequate, or weak). Consider:
- Does it reference specific evidence from the case?
- Does it address the suspect's motive and opportunity?
- Are counterarguments to alternatives addressed?
- Is it logically sound?

Respond with ONLY one word: "thorough", "adequate", or "weak".`;

  const qualityResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt: qualityPrompt });
  const quality = (qualityResponse.response || '').toLowerCase().trim();
  const analysisQuality = quality.includes('weak') ? 'unsatisfactory' : quality.includes('adequate') ? 'satisfactory' : 'thorough';
  
  const analysisPrompt = `Mission: ${missionTitle}. Description: ${missionData.description}. Scenario: ${missionData.scenario}. Correct suspect: ${correctCharacter.name}.

Player's report: Suspect - ${selectedCharacter.name}. Justification: ${justification}.

Conversation history:
${historyText}

Analyze if the player's report covers all critical evidence and reasoning. Provide brief feedback on completeness and reasoning quality. Keep it to 1-2 sentences.`;

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt: analysisPrompt });
  
  return {
    analysis: aiResponse.response || 'Analysis unavailable.',
    analysisQuality: analysisQuality,
    ethicsIssues: ethicsIssues || undefined
  };
}
