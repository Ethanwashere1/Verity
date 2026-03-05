// Cloudflare Worker for AI proxy using Cloudflare AI bindings
// Handles character chat, prompt suggestions, and report analysis

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/ai') {
      try {
        const body = await request.json();
        const { requestType } = body;

        let responseText = '';

        if (requestType === 'character_chat') {
          responseText = await handleCharacterChat(body, env);
        } else if (requestType === 'prompt_suggestion') {
          responseText = await handlePromptSuggestion(body, env);
        } else if (requestType === 'report_analysis') {
          responseText = await handleReportAnalysis(body, env);
        } else {
          throw new Error('Unknown request type');
        }

        return new Response(JSON.stringify({ response: responseText }), {
          headers: { 'content-type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleCharacterChat({ characterId, characterName, persona, traits, communicationStyle, missionId, missionTitle, conversationHistory }, env) {
  const systemPrompt = `You are ${characterName}, a character in the mission "${missionTitle}". Your persona: ${persona}. Traits: ${traits.join(', ')}. Communication style: ${communicationStyle}. Respond in character, staying true to your role. Keep responses concise.`;

  const messages = [{ role: 'system', content: systemPrompt }, ...conversationHistory];

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { messages });
  return aiResponse.response || 'I have nothing to say.';
}

async function handlePromptSuggestion({ characterId, missionId, userMessage }, env) {
  const prompt = `The user asked a character in a detective game: "${userMessage}". Suggest a better, more effective way to phrase this question to get useful information. Keep it short.`;

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt });
  return aiResponse.response || '';
}

async function handleReportAnalysis({ missionId, missionTitle, characterId, justification, conversationHistory, missionData }, env) {
  const historyText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  const prompt = `Mission: ${missionTitle}. Description: ${missionData.description}. Scenario: ${missionData.scenario}. Correct suspect: ${missionData.characters.find(c => c.id === missionData.correctCharacter).name}.

Player's report: Suspect - ${missionData.characters.find(c => c.id === characterId).name}. Justification: ${justification}.

Conversation history:
${historyText}

Analyze if the player's report covers all critical evidence and reasoning. Provide feedback on completeness. Keep it concise.`;

  const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { prompt });
  return aiResponse.response || 'Analysis unavailable.';
}
