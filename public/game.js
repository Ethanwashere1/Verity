// game.js - separate game logic for mission timeline with mission memory system

// Mission-specific data structure
const missionsData = {
    '1': {
        title: 'The Museum Heist',
        description: 'A priceless artifact has been stolen from the museum. Investigate the suspects and uncover who committed the crime.',
        scenario: 'The theft occurred during the night shift on March 15th. Security footage was disabled.',
        correctCharacter: 'char1',
        characters: [
            { id: 'char1', name: 'Detective Morgan', bio: 'Senior detective with 20 years experience. Recently passed over for promotion.', image: 'Assets/Detective 1 SVG.svg', unethical: true },
            { id: 'char2', name: 'Guard Jenkins', bio: 'Night security guard. Has a clean record and excellent attendance.', image: 'Assets/Guard 1 SVG.svg', unethical: false },
            { id: 'char3', name: 'Curator Webb', bio: 'Museum curator and expert in ancient artifacts. Loves the collection.', image: 'Assets/Curator 1 SVG.svg', unethical: false }
        ],
        evidence: [
            { title: 'Photo', content: 'Security camera shows masked individual entering artifact vault at 2:47 AM.' },
            { title: 'Witness Statement', content: 'Janitor reported seeing someone in detective\'s uniform near the vault.' },
            { title: 'Forensic Report', content: 'Fingerprints found on lock mechanism match Detective Morgan\'s on file.' }
        ]
    },
    '2': {
        title: 'The CEO\'s Secret',
        description: 'Corporate embezzlement has been discovered. Track down the executive responsible for the $2M theft.',
        scenario: 'Missing funds were transferred to offshore accounts over the past 6 months. Three executives have access.',
        correctCharacter: 'char2',
        characters: [
            { id: 'char1', name: 'Sarah Chen', bio: 'VP of Operations. Joined company 3 years ago with impeccable credentials.', image: 'Assets/Prisoner 1 SVG.svg', unethical: false },
            { id: 'char2', name: 'Marcus Davis', bio: 'CFO and long-time employee. Recently dealing with serious personal financial issues.', image: 'Assets/Prisoner 1 SVG.svg', unethical: true },
            { id: 'char3', name: 'Lisa Park', bio: 'Accounting Director. Mother of two, stable family life, devoted to company.', image: 'Assets/Prisoner 1 SVG.svg', unethical: false }
        ],
        evidence: [
            { title: 'Bank Records', content: 'Offshore account opened under shell company linked to CFO\'s offshore address.' },
            { title: 'Email Trail', content: 'Suspicious communications between CFO and known money laundering contacts.' },
            { title: 'Device Log', content: 'Company server accessed from CFO\'s personal laptop during off-hours transfers.' }
        ]
    },
    '3': {
        title: 'The Poisoned Partnership',
        description: 'A business partner has been poisoned. Investigate the three competitors with motive, means, and opportunity.',
        scenario: 'Victim was poisoned with arsenic at a business dinner. Three business rivals attended the event.',
        correctCharacter: 'char3',
        characters: [
            { id: 'char1', name: 'Robert Trump', bio: 'Rival businessman. Outcompeted by victim in multiple deals recently.', image: 'Assets/Prisoner 1 SVG.svg', unethical: false },
            { id: 'char2', name: 'Victoria Stone', bio: 'Business partner with grudge. Lost $500K deal to victim last month.', image: 'Assets/Prisoner 1 SVG.svg', unethical: false },
            { id: 'char3', name: 'James Norton', bio: 'Disgruntled ex-partner. Victim ended partnership and took clients.', image: 'Assets/Prisoner 1 SVG.svg', unethical: true }
        ],
        evidence: [
            { title: 'Toxicology Report', content: 'Arsenic detected in victim\'s wine glass. Rare strain traceable to specific source.' },
            { title: 'Purchase Records', content: 'James Norton purchased arsenic compound 2 weeks prior under false name.' },
            { title: 'Witness Account', content: 'Waiter saw Norton handling victim\'s glass during dinner service.' }
        ]
    }
};

// global state
let currentMission = null;
let hearts = 5; // starting hearts
let missionMemory = {}; // stores game state per mission

// initialize page behaviors when loaded
function initGamePage() {
    const missions = document.querySelectorAll('.missions .mission-box');
    missions.forEach(box => {
        box.addEventListener('click', () => {
            const missionId = box.dataset.mission;
            if (missionId === '2' || missionId === '3') {
                alert('In progress');
            } else {
                showMission(box.dataset.mission);
            }
        });
    });

    const briefingButtons = document.querySelectorAll('.briefing-btn');
    briefingButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const missionId = button.dataset.mission;
            if (missionsData[missionId]) {
                showMissionDetails(missionsData[missionId]);
            }
        });
    });

    // wire back-to-timeline if present
    const backBtn = document.getElementById('back-to-timeline');
    if (backBtn) backBtn.addEventListener('click', backToTimeline);

    const missionBriefingBtn = document.getElementById('view-mission-briefing');
    if (missionBriefingBtn) {
        missionBriefingBtn.addEventListener('click', () => {
            if (currentMission && missionsData[currentMission]) {
                showMissionDetails(missionsData[currentMission]);
            }
        });
    }

    // verdict modal handlers
    const openVerdict = document.getElementById('open-verdict');
    if (openVerdict) openVerdict.addEventListener('click', () => {
        document.getElementById('verdict-modal').classList.add('active');
    });
    const vClose = document.querySelector('#verdict-modal .modal-close');
    if (vClose) vClose.addEventListener('click', closeVerdict);
    const vModal = document.getElementById('verdict-modal');
    if (vModal) vModal.addEventListener('click', (e) => { if (e.target === vModal) closeVerdict(); });

    // verdict submit handler
    const vSubmit = document.getElementById('verdict-submit');
    if (vSubmit) vSubmit.addEventListener('click', submitVerdict);
    
    // completion modal handler
    const returnBtn = document.getElementById('return-to-timeline');
    if (returnBtn) returnBtn.addEventListener('click', returnToTimeline);
    
    // chat handlers
    const chatSend = document.getElementById('chat-send');
    if (chatSend) chatSend.addEventListener('click', sendChatMessage);
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
        // as the user types, optionally ask the AI for a better prompt
        let suggestionTimer;
        chatInput.addEventListener('input', () => {
            clearTimeout(suggestionTimer);
            suggestionTimer = setTimeout(() => {
                const text = chatInput.value.trim();
                const characterId = document.getElementById('chat-interface').dataset.currentCharacter;
                if (text && characterId) {
                    getPromptSuggestion(text, characterId).then(displayPromptSuggestion);
                } else {
                    displayPromptSuggestion('');
                }
            }, 500);
        });
    }
}

function showMission(id) {
    currentMission = id;
    hearts = 5; // reset hearts on new mission
    updateHearts();
    
    // Initialize mission memory if not already done
    if (!missionMemory[id]) {
        // create chat containers per character so messages persist for the duration of the mission
        const chats = {};
        missionsData[id].characters.forEach(c => { chats[c.id] = []; });
        missionMemory[id] = {
            attempts: 0,
            verdicts: [],
            chats: chats
        };
    }
    
    // Show mission details modal
    showMissionDetails(missionsData[id]);
    
    document.getElementById('timeline').style.display = 'none';
    const gameArea = document.getElementById('game-area');
    gameArea.style.display = 'grid';
    
    // Get mission-specific data
    const missionData = missionsData[id];
    const characters = missionData.characters;
    const evidence = missionData.evidence;

    const charList = document.getElementById('character-list');
    charList.innerHTML = '';
    characters.forEach(c => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        
        // create container for image and name
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '12px';
        container.style.flexDirection = 'row';
        
        // create circle image (smaller now, positioned on left)
        const circleImg = document.createElement('img');
        circleImg.src = c.image;
        circleImg.alt = c.name;
        circleImg.style.width = '48px';
        circleImg.style.height = '48px';
        circleImg.style.borderRadius = '50%';
        circleImg.style.objectFit = 'cover';
        circleImg.style.flexShrink = '0';
        
        // create name span
        const nameSpan = document.createElement('span');
        nameSpan.textContent = c.name;
        nameSpan.style.fontSize = '14px';
        nameSpan.style.fontWeight = 'bold';
        nameSpan.style.textAlign = 'left';
        nameSpan.style.flex = '1';
        
        container.appendChild(circleImg);
        container.appendChild(nameSpan);
        btn.appendChild(container);
        
        btn.dataset.char = c.id;
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.padding = '12px';
        btn.addEventListener('click', () => {
            // when selecting a character, deactivate evidence tab
            const evTab = document.querySelector('.evidence-tab'); if (evTab) evTab.classList.remove('active');
            selectCharacter(c, evidence);
        });
        li.appendChild(btn);
        charList.appendChild(li);
    });

    // add evidence tab as another "character"-style button
    const evidenceLi = document.createElement('li');
    const evidenceBtn = document.createElement('button');
    evidenceBtn.className = 'evidence-tab';
    evidenceBtn.textContent = 'Additional Evidence';
    evidenceBtn.style.padding = '12px';
    evidenceBtn.style.fontSize = '16px';
    evidenceBtn.addEventListener('click', () => {
        // deactivate any character active state
        document.querySelectorAll('#character-list button').forEach(b => b.classList.remove('active'));
        evidenceBtn.classList.add('active');
        // Hide chat interface when viewing evidence
        const chatInterface = document.getElementById('chat-interface');
        if (chatInterface) chatInterface.style.display = 'none';
        showEvidenceReport(evidence);
    });
    evidenceLi.appendChild(evidenceBtn);
    charList.appendChild(evidenceLi);

    // populate verdict dropdown
    const verdictSelect = document.getElementById('verdict-select');
    verdictSelect.innerHTML = '<option value="">Choose...</option>';
    characters.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        verdictSelect.appendChild(opt);
    });

    // preselect first character
    selectCharacter(characters[0], evidence);
}

function selectCharacter(character, evidenceArray) {
    // mark active button
    document.querySelectorAll('#character-list button').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`#character-list button[data-char="${character.id}"]`);
    if (btn) btn.classList.add('active');
    // ensure evidence tab is not active
    const evTab = document.querySelector('.evidence-tab'); if (evTab) evTab.classList.remove('active');
    showCharacterDetail(character, evidenceArray[0]);
    
    // Show chat interface and initialize chat
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) {
        chatInterface.style.display = 'flex';
        // Store current character for chat context
        chatInterface.dataset.currentCharacter = character.id;
        chatInterface.dataset.characterName = character.name;
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';
        // Restore saved messages for this mission+character (chronological order)
        const saved = (missionMemory[currentMission] && missionMemory[currentMission].chats && missionMemory[currentMission].chats[character.id]) || [];
        saved.forEach(msg => {
            addChatMessage(msg.text, msg.sender);
        });
        // clear any leftover prompt suggestion from previous conversation
        displayPromptSuggestion('');
    }
}

function showCharacterDetail(character, evidenceArray) {
    const right = document.getElementById('character-detail');
    right.innerHTML = '';
    
    // Set background image for the panel
    right.style.backgroundImage = `url('${character.image}')`;
    right.style.backgroundSize = 'cover';
    right.style.backgroundPosition = 'center 30%';
    right.style.backgroundAttachment = 'scroll';
    right.style.position = 'relative';
    
    // Create overlay for readability (reduced opacity for brightness)
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5))';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '0';
    right.appendChild(overlay);
    
    // Create sticky header container (stays at top of right panel)
    const header = document.createElement('div');
    header.className = 'character-header-fixed';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.zIndex = '10';
    header.style.background = 'linear-gradient(90deg, rgba(10, 4, 21, 0.8), #13102f)';
    header.style.padding = '20px';
    header.style.borderRadius = '0';
    header.style.backdropFilter = 'blur(10px)';
    header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    header.style.opacity = '1';
    header.style.transition = 'opacity 0.4s ease';
    
    const h = document.createElement('h2');
    h.textContent = character.name;
    h.style.margin = '0 0 8px 0';
    h.style.fontSize = '28px';
    h.style.color = '#d946a6';
    
    const bio = document.createElement('p');
    bio.textContent = character.bio;
    bio.style.margin = '0';
    bio.style.fontSize = '14px';
    bio.style.lineHeight = '1.5';
    bio.style.color = '#ddd';
    
    header.appendChild(h);
    header.appendChild(bio);
    right.appendChild(header);
    
    // Auto-hide header after 5 seconds
    setTimeout(() => {
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
    }, 2500);
    
    // Content padding adjusted since header is sticky and inside the scrollable container
    const spacer = document.createElement('div');
    spacer.style.padding = '20px';
    spacer.style.paddingTop = '0';
    right.appendChild(spacer);
}

function showEvidenceReport(evidenceArray) {
    const right = document.getElementById('character-detail');
    right.innerHTML = '';
    
    // Set background (no character image for evidence report)
    right.style.backgroundImage = 'none';
    right.style.backgroundColor = '#0e0e10';
    right.style.position = 'relative';
    right.style.justifyContent = 'center';
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'linear-gradient(rgba(10,10,15,0.8), rgba(10,10,15,0.9))';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '0';
    right.appendChild(overlay);
    
    // Create sticky header container (stays at top when scrolling)
    const header = document.createElement('div');
    header.className = 'character-header-fixed';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.zIndex = '10';
    header.style.background = 'linear-gradient(90deg, rgba(10, 4, 21, 0.8), #13102f)';
    header.style.padding = '20px';
    header.style.borderRadius = '0';
    header.style.backdropFilter = 'blur(10px)';
    header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    
    const h = document.createElement('h2');
    h.textContent = 'Additional Evidence Report';
    h.style.margin = '0';
    h.style.fontSize = '28px';
    h.style.color = '#d946a6';
    h.style.textShadow = '0 0 10px rgba(217, 70, 166, 0.5)';
    
    header.appendChild(h);
    right.appendChild(header);
    
    // Create scrollable content
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.position = 'relative';
    content.style.zIndex = '1';
    content.style.display = 'flex';
    content.style.justifyContent = 'center';
    content.style.alignItems = 'flex-start';
    
    const report = document.createElement('div');
    report.style.textAlign = 'left';
    report.style.background = 'linear-gradient(180deg, rgba(14,14,16,0.9), rgba(20,20,24,0.9))';
    report.style.padding = '24px';
    report.style.borderRadius = '12px';
    report.style.color = '#ddd';
    report.style.backdropFilter = 'blur(15px)';
    report.style.maxWidth = '600px';
    report.style.width = '100%';
    report.style.border = '1px solid rgba(217, 70, 166, 0.2)';
    report.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    
    evidenceArray.forEach((ev, idx) => {
        const item = document.createElement('div');
        item.style.marginBottom = '24px';
        item.style.paddingBottom = '18px';
        item.style.borderBottom = '1px solid rgba(217, 70, 166, 0.3)';
        
        if (idx === evidenceArray.length - 1) {
            item.style.borderBottom = 'none';
            item.style.marginBottom = '0';
            item.style.paddingBottom = '0';
        }
        
        const itemTitle = document.createElement('h3');
        itemTitle.textContent = `${idx+1}. ${ev.title}`;
        itemTitle.style.fontSize = '18px';
        itemTitle.style.margin = '0 0 12px 0';
        itemTitle.style.color = '#d946a6';
        itemTitle.style.fontWeight = '600';
        
        const itemContent = document.createElement('p');
        itemContent.textContent = ev.content;
        itemContent.style.margin = '0';
        itemContent.style.fontSize = '14px';
        itemContent.style.lineHeight = '1.6';
        itemContent.style.color = '#ddd';
        
        item.appendChild(itemTitle);
        itemContent.style.color = '#ddd';
        
        item.appendChild(itemTitle);
        item.appendChild(itemContent);
        report.appendChild(item);
    });
    content.appendChild(report);
    right.appendChild(content);
}

function backToTimeline() {
    // hide chat interface and clear chat memory for the mission (messages persist only while in mission)
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) {
        chatInterface.style.display = 'none';
        chatInterface.dataset.currentCharacter = '';
        chatInterface.dataset.characterName = '';
    }
    displayPromptSuggestion('');
    // keep conversation history around so the AI instances remain intact if
    // player revisits the same mission during this session
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('timeline').style.display = 'block';
    currentMission = null;
}

function closeVerdict() {
    const vModal = document.getElementById('verdict-modal');
    vModal.classList.remove('active');
}

function deductHeart() {
    if (hearts > 0) {
        hearts--;
        updateHearts();
    }
}

function updateHearts() {
    const heartsContainer = document.getElementById('hearts-display');
    if (heartsContainer) {
        heartsContainer.innerHTML = '❤️'.repeat(hearts);
    }
}

async function submitVerdict() {
    const verdictSelect = document.getElementById('verdict-select');
    const verdictJust = document.getElementById('verdict-just');
    const warningDiv = document.getElementById('verdict-warning');
    const selectedCharId = verdictSelect.value;
    const justification = verdictJust.value.trim();

    // clear previous warning
    if (warningDiv) {
        warningDiv.style.display = 'none';
        warningDiv.textContent = '';
    }

    if (!selectedCharId || !justification) {
        // show inline warning instead of modal so the game remains visible
        if (warningDiv) {
            let msg = 'Please ';
            if (!selectedCharId && !justification) msg += 'choose a suspect and enter your justification.';
            else if (!selectedCharId) msg += 'choose a suspect.';
            else msg += 'provide your justification.';
            warningDiv.textContent = msg;
            warningDiv.style.display = 'block';
        }
        return;
    }

    // increment mission attempts in memory
    missionMemory[currentMission].attempts++;
    missionMemory[currentMission].verdicts.push(selectedCharId);
    
    // check if verdict is correct
    const correctCharId = missionsData[currentMission].correctCharacter;
    const correctCharName = missionsData[currentMission].characters.find(c => c.id === correctCharId).name;
    
    // Check if notification modal exists and disable submit button during analysis
    const verdictModal = document.getElementById('verdict-modal');
    const submitBtn = document.getElementById('verdict-submit');
    const originalBtnText = submitBtn?.textContent || 'Submit';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing Report...';
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
    }
    
    // ask AI to review the justification/report
    const reportData = await analyzeReport(selectedCharId, justification);
    let analysisText = reportData.analysis ? `\n\nAI Review: ${reportData.analysis}` : '';
    
    // Re-enable submit button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }
    
    // Show weak justification notification only for correct verdicts (they can still win but should improve)
    if (reportData.analysisQuality === 'unsatisfactory' && selectedCharId === correctCharId) {
        showNotification(
            'Weak Justification',
            'You identified the correct suspect, but your justification was not thorough. Consider gathering more evidence and asking more targeted questions in future missions.'
        );
    }

    if (selectedCharId === correctCharId) {
        // Mark mission as completed
        missionMemory[currentMission].completed = true;
        markMissionCompleted(currentMission);
        
        // Show completion modal with appended analysis
        showMissionComplete(`You correctly identified ${correctCharName} as guilty!${analysisText}`);
    } else {
        const wrongCharName = missionsData[currentMission].characters.find(c => c.id === selectedCharId).name;
        
        // For incorrect verdicts, show the analysis and ethics issues if any
        let errorMsg = `You accused ${wrongCharName}, but the guilty party was ${correctCharName}. You lost a heart!`;
        if (reportData.ethicsIssues) {
            errorMsg += `\n⚠️ ${reportData.ethicsIssues}`;
        }
        errorMsg += analysisText;
        
        showNotification('Incorrect Verdict', errorMsg);
        deductHeart();
    }

    // close modal
    closeVerdict();
    // clear inputs
    verdictSelect.value = '';
    verdictJust.value = '';
}

function showMissionDetails(mission) {
    const modal = document.getElementById('mission-details-modal');
    document.getElementById('mission-title-detail').textContent = mission.title;
    document.getElementById('mission-description').textContent = mission.description;
    document.getElementById('mission-scenario').textContent = mission.scenario;
    modal.classList.add('active');
}

function closeMissionDetails() {
    const modal = document.getElementById('mission-details-modal');
    modal.classList.remove('active');
}

function showNotification(title, message) {
    const modal = document.getElementById('notification-modal');
    document.getElementById('notification-title').textContent = title;
    const msgEl = document.getElementById('notification-message');
    msgEl.innerHTML = message.replace(/\n/g, '<br>');
    modal.classList.add('active');
}

function closeNotification() {
    const modal = document.getElementById('notification-modal');
    modal.classList.remove('active');
}

function showMissionComplete(message) {
    const modal = document.getElementById('mission-complete-modal');
    const msgEl = document.getElementById('complete-message');
    // convert line breaks to <br> so multi‑line messages (analysis, etc.) show
    msgEl.innerHTML = message.replace(/\n/g, '<br>');
    modal.classList.add('active');
}

function markMissionCompleted(missionId) {
    const missionBox = document.querySelector(`.mission-box[data-mission="${missionId}"]`);
    if (missionBox) {
        missionBox.classList.add('completed');
    }
}

function returnToTimeline() {
    const modal = document.getElementById('mission-complete-modal');
    modal.classList.remove('active');
    backToTimeline();
}

function displayPromptSuggestion(text) {
    const box = document.getElementById('prompt-suggestion');
    if (box) {
        if (text) {
            box.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;"><span style="flex: 1;">${text}</span><button class="prompt-close-btn" onclick="document.getElementById('prompt-suggestion').style.display='none'">✕</button></div>`;
            box.style.display = 'block';
        } else {
            box.innerHTML = '';
            box.style.display = 'none';
        }
    }
}

async function getPromptSuggestion(userMessage, characterId) {
    if (!aiModelConfig.enabled || !aiModelConfig.apiEndpoint) return '';
    try {
        const data = await postToAI({
            requestType: 'prompt_suggestion',
            characterId,
            missionId: currentMission,
            userMessage,
            ethicsCheck: true  // Request ethics analysis
        });
        
        let suggestion = data.suggestion || '';
        
        // Check for ethical violations in the user's message
        if (data.ethicsViolation) {
            suggestion += '\n⚠️ ' + data.ethicsViolation;
        }
        
        return suggestion;
    } catch (e) {
        console.warn('prompt suggestion failed', e);
        return '';
    }
}

async function analyzeReport(characterId, justification) {
    if (!aiModelConfig.enabled || !aiModelConfig.apiEndpoint) {
        return { analysis: null, analysisQuality: null };
    }
    try {
        const mission = missionsData[currentMission];
        const history = missionMemory[currentMission]?.chats?.[characterId] || [];
        const data = await postToAI({
            requestType: 'report_analysis',
            missionId: currentMission,
            missionTitle: mission.title,
            characterId,
            justification,
            conversationHistory: history,
            missionData: mission
        });
        
        // Return the full response object with analysis, quality, and ethics issues
        return {
            analysis: data.analysis || null,
            analysisQuality: data.analysisQuality || null,
            ethicsIssues: data.ethicsIssues || null
        };
    } catch (e) {
        console.warn('report analysis failed', e);
        return { analysis: null, analysisQuality: null };
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chat-messages');
    const chatInterface = document.getElementById('chat-interface');
    const characterName = chatInterface.dataset.characterName;
    const characterId = chatInterface.dataset.currentCharacter;
    
    // Add user message
    addChatMessage(message, 'user');
    // persist user message for this mission + character
    if (missionMemory[currentMission] && missionMemory[currentMission].chats) {
        const arr = missionMemory[currentMission].chats[characterId] || [];
        arr.push({ sender: 'user', text: message, ts: Date.now() });
        missionMemory[currentMission].chats[characterId] = arr;
    }
    chatInput.value = '';

    // Show typing indicator
    const typingIndicatorEl = document.createElement('div');
    typingIndicatorEl.className = 'chat-message character typing-message';
    typingIndicatorEl.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    chatMessages.prepend(typingIndicatorEl);

    // ask AI for a prompt improvement suggestion and display it
    getPromptSuggestion(message, characterId).then(displayPromptSuggestion);
    
    // Get character response from AI model or fallback
    getCharacterResponseFromAI(characterId, message).then(response => {
        // Remove typing indicator
        typingIndicatorEl.remove();
        
        if (response) {
            addChatMessage(response, 'character');
            // persist character response
            if (missionMemory[currentMission] && missionMemory[currentMission].chats) {
                const arr = missionMemory[currentMission].chats[characterId] || [];
                arr.push({ sender: 'character', text: response, ts: Date.now() });
                missionMemory[currentMission].chats[characterId] = arr;
            }
        }
    }).catch(error => {
        // Remove typing indicator
        typingIndicatorEl.remove();
        
        console.error('Error getting character response:', error);
        const fallbackResponse = getCharacterResponseFallback(characterId);
        addChatMessage(fallbackResponse, 'character');
        if (missionMemory[currentMission] && missionMemory[currentMission].chats) {
            const arr = missionMemory[currentMission].chats[characterId] || [];
            arr.push({ sender: 'character', text: fallbackResponse, ts: Date.now() });
            missionMemory[currentMission].chats[characterId] = arr;
        }
    });
}

function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.textContent = text;
    // Prepend so newest messages appear at the visual bottom (using column-reverse layout)
    chatMessages.prepend(messageEl);
    
    // With column-reverse layout, set scrollTop to 0 to keep newest visible
    try { chatMessages.scrollTop = 0; } catch (e) { /* ignore */ }
}

// Character AI Integration System
// This system supports integration with external AI models for character responses
const characterProfiles = {
    'char1': {
        name: 'Detective Morgan',
        persona: 'experienced-investigator',
        systemPrompt: 'You are Detective Morgan, a senior detective with 20 years of experience. You are experienced, methodical, and defensive when questioned about sensitive matters.',
        traits: ['experienced', 'defensive', 'professional', 'somewhat-guarded'],
        communicationStyle: 'formal-and-measured'
    },
    'char2': {
        name: 'Guard Jenkins',
        persona: 'security-professional',
        systemPrompt: 'You are Guard Jenkins, a night security guard with a clean record. You are straightforward, honest, and professional in your duties.',
        traits: ['honest', 'straightforward', 'vigilant', 'professional'],
        communicationStyle: 'friendly-and-direct'
    },
    'char3': {
        name: 'Curator Webb',
        persona: 'art-expert',
        systemPrompt: 'You are Curator Webb, a museum curator with deep expertise in artifacts. You are passionate about the collection and defensive about its security and preservation.',
        traits: ['passionate', 'knowledgeable', 'protective', 'articulate'],
        communicationStyle: 'educated-and-passionate'
    }
};

// Configuration for AI Model Integration
// NOTE: the frontend must never contain the API key directly.  Instead
// we proxy requests through a Cloudflare Worker that adds the secret from
// env vars.  The worker is defined under `src/index.js` and the key is
// configured via `wrangler secret put AI_API_KEY` (or similar).
//
// The worker is dumb and just proxies whatever JSON we send.  the
// different helper functions below build bodies suited to each task
// (character chat, prompt suggestion, report review).
const aiModelConfig = {
    enabled: true,  // Set to true when your AI model is ready
    // point at our own worker; the worker will forward to the real AI
    // endpoint using a secret key stored in the Cloudflare environment
    apiEndpoint: '/api/ai',
    defaultTimeout: 5000,  // 5 second timeout for AI responses
    fallbackResponses: true  // Use fallback responses if AI service fails
};

// Function to send message to AI model for character response
// generic POST helper that goes through the worker proxy
async function postToAI(body) {
    const resp = await fetch(aiModelConfig.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        timeout: aiModelConfig.defaultTimeout
    });
    if (!resp.ok) throw new Error(`AI proxy returned ${resp.status}`);
    return resp.json();
}

async function getCharacterResponseFromAI(characterId, userMessage) {
    const character = characterProfiles[characterId];
    if (!character) return getCharacterResponseFallback(characterId);
    if (!aiModelConfig.enabled || !aiModelConfig.apiEndpoint) {
        return getCharacterResponseFallback(characterId);
    }

    // build conversation history for this character (so each char is a
    // persistent AI instance within a mission).  The worker/backend can
    // use this to maintain a context window.
    const history = [];
    // include hidden system prompt / story context first
    history.push({ role: 'system', content: character.systemPrompt });

    const saved = missionMemory[currentMission]?.chats?.[characterId] || [];
    saved.forEach(msg => {
        history.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text });
    });
    // include the new user message as well
    history.push({ role: 'user', content: userMessage });

    try {
        const data = await postToAI({
            requestType: 'character_chat',
            characterId,
            characterName: character.name,
            persona: character.persona,
            traits: character.traits,
            communicationStyle: character.communicationStyle,
            missionId: currentMission,
            missionTitle: missionsData[currentMission].title,
            conversationHistory: history
        });
        return data.response || getCharacterResponseFallback(characterId);
    } catch (error) {
        console.warn('AI model request failed:', error);
        return aiModelConfig.fallbackResponses ? getCharacterResponseFallback(characterId) : null;
    }
}

// Fallback responses for when AI model is not available
function getCharacterResponseFallback(characterId) {
    const fallbackResponses = {
        'char1': [
            'I don\'t appreciate these accusations. I have nothing to hide.',
            'You need more evidence before you can prove anything.',
            'I\'ve been doing this job for twenty years with a clean record.',
            'I don\'t know what you\'re implying, but I want a lawyer.'
        ],
        'char2': [
            'I was just doing my security rounds as usual.',
            'I have no idea what you\'re talking about.',
            'My job is to protect the building, not steal from it.',
            'I\'ve never had any trouble before this incident.'
        ],
        'char3': [
            'This collection means everything to me. I would never harm it.',
            'I love these artifacts more than anyone else does.',
            'The security breach must have been an inside job.',
            'I\'ve dedicated my life to preserving these pieces.'
        ]
    };
    
    const responses = fallbackResponses[characterId] || [
        'I\'m not sure what you mean by that.',
        'Can you elaborate on that question?',
        'That\'s an interesting observation.',
        'I don\'t have anything to say about that.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Wire up all modal handlers and initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game page if on game page
    if (document.body.classList.contains('game-page')) {
        updateHearts(); // initialize hearts display
        initGamePage();
    }
    
    // Wire up notification modal close handlers
    const nClose = document.querySelector('#notification-modal .modal-close');
    if (nClose) nClose.addEventListener('click', closeNotification);
    const nModal = document.getElementById('notification-modal');
    if (nModal) nModal.addEventListener('click', (e) => { if (e.target === nModal) closeNotification(); });
    
    // Wire up mission details modal close handlers
    const mClose = document.querySelector('#mission-details-modal .modal-close');
    if (mClose) mClose.addEventListener('click', closeMissionDetails);
    const mModal = document.getElementById('mission-details-modal');
    if (mModal) mModal.addEventListener('click', (e) => { if (e.target === mModal) closeMissionDetails(); });
    
    // Wire up mission complete modal close handlers (clicking outside closes it)
    const completeModal = document.getElementById('mission-complete-modal');
    if (completeModal) {
        completeModal.addEventListener('click', (e) => {
            if (e.target === completeModal) returnToTimeline();
        });
    }
});

