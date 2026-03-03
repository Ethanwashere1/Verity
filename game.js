// game.js - separate game logic for mission timeline with mission memory system

// Mission-specific data structure
const missionsData = {
    '1': {
        title: 'The Museum Heist',
        description: 'A priceless artifact has been stolen from the museum. Investigate the suspects and uncover who committed the crime.',
        scenario: 'The theft occurred during the night shift on March 15th. Security footage was disabled.',
        correctCharacter: 'char1',
        characters: [
            { id: 'char1', name: 'Detective Morgan', bio: 'Senior detective with 20 years experience. Recently passed over for promotion.', image: 'Assets/Prisoner 1 SVG.svg', unethical: true },
            { id: 'char2', name: 'Guard Jenkins', bio: 'Night security guard. Has a clean record and excellent attendance.', image: 'Assets/Prisoner 1 SVG.svg', unethical: false },
            { id: 'char3', name: 'Curator Webb', bio: 'Museum curator and expert in ancient artifacts. Loves the collection.', image: 'Assets/Prisoner 1 SVG.svg', unethical: false }
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
            showMission(box.dataset.mission);
        });
    });

    // wire back-to-timeline if present
    const backBtn = document.getElementById('back-to-timeline');
    if (backBtn) backBtn.addEventListener('click', backToTimeline);

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
}

function showMission(id) {
    currentMission = id;
    hearts = 5; // reset hearts on new mission
    updateHearts();
    
    // Initialize mission memory if not already done
    if (!missionMemory[id]) {
        missionMemory[id] = {
            attempts: 0,
            verdicts: []
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
    header.style.background = 'linear-gradient(90deg, rgba(20,20,28,0.98), rgba(20,20,28,0.95))';
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
    h.style.color = '#6cf';
    
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
    header.style.background = 'linear-gradient(90deg, rgba(20,20,28,0.98), rgba(20,20,28,0.95))';
    header.style.padding = '20px';
    header.style.borderRadius = '0';
    header.style.backdropFilter = 'blur(10px)';
    header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    
    const h = document.createElement('h2');
    h.textContent = 'Additional Evidence Report';
    h.style.margin = '0';
    h.style.fontSize = '28px';
    h.style.color = '#6cf';
    
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
    report.style.background = 'rgba(14,14,16,0.9)';
    report.style.padding = '20px';
    report.style.borderRadius = '8px';
    report.style.color = '#ddd';
    report.style.backdropFilter = 'blur(10px)';
    report.style.maxWidth = '600px';
    report.style.width = '100%';
    
    evidenceArray.forEach((ev, idx) => {
        const item = document.createElement('div');
        item.style.marginBottom = '20px';
        item.style.paddingBottom = '15px';
        item.style.borderBottom = '1px solid #444';
        
        if (idx === evidenceArray.length - 1) {
            item.style.borderBottom = 'none';
            item.style.marginBottom = '0';
            item.style.paddingBottom = '0';
        }
        
        const itemTitle = document.createElement('h3');
        itemTitle.textContent = `${idx+1}. ${ev.title}`;
        itemTitle.style.fontSize = '18px';
        itemTitle.style.margin = '0 0 10px 0';
        itemTitle.style.color = '#6cf';
        
        const itemContent = document.createElement('p');
        itemContent.textContent = ev.content;
        itemContent.style.margin = '0';
        itemContent.style.fontSize = '14px';
        itemContent.style.lineHeight = '1.6';
        itemContent.style.color = '#ddd';
        
        item.appendChild(itemTitle);
        item.appendChild(itemContent);
        report.appendChild(item);
    });
    content.appendChild(report);
    right.appendChild(content);
}

function backToTimeline() {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('timeline').style.display = 'block';
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

function submitVerdict() {
    const verdictSelect = document.getElementById('verdict-select');
    const verdictJust = document.getElementById('verdict-just');
    const selectedCharId = verdictSelect.value;
    const justification = verdictJust.value.trim();

    if (!selectedCharId || !justification) {
        showNotification('Incomplete Verdict', 'Please select a character and provide justification.');
        return;
    }

    // increment mission attempts in memory
    missionMemory[currentMission].attempts++;
    missionMemory[currentMission].verdicts.push(selectedCharId);
    
    // check if verdict is correct
    const correctCharId = missionsData[currentMission].correctCharacter;
    const correctCharName = missionsData[currentMission].characters.find(c => c.id === correctCharId).name;
    
    if (selectedCharId === correctCharId) {
        showNotification('Correct Verdict!', `You correctly identified ${correctCharName} as guilty. Hearts remaining: ${hearts}`);
    } else {
        const wrongCharName = missionsData[currentMission].characters.find(c => c.id === selectedCharId).name;
        showNotification('Incorrect Verdict', `You accused ${wrongCharName}, but the guilty party was ${correctCharName}. You lost a heart!`);
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
    document.getElementById('notification-message').textContent = message;
    modal.classList.add('active');
}

function closeNotification() {
    const modal = document.getElementById('notification-modal');
    modal.classList.remove('active');
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
});

