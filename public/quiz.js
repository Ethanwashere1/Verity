// quiz.js - basic quiz framework

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('quiz-page')) {
        initQuiz();
    }
});

let currentQuestion = 0;
let answers = []; // store selected choices by index

// placeholder questions array, 15 items with empty data
const questions = [
    {
    number: `Question 1`,
    text: `You notice that an answer given by prompting an AI for help does not seem to match with your context. What is an effective method for increasing the accuracy of its output?`,
    options: ['Correct syntax and grammar of the prompt','Add emotional impact and urgency to your prompt','Add more detailed context to your prompt','Tell the AI to give an in-depth, detailed response'],
    correct: 2
    },
    {
    number: `Question 2`,
    text: `Say that you’ve been asked to create a flyer for the school e-sports club and you decide to enlist the help of AI. Which of the following prompting strategies is least likely to be effective?`,
    options: ['Include the date and time of the interest meeting','Telling the AI to be persuasive and eloquent in its language','Asking the AI to include the benefits of membership','Providing the AI with a list of the school’s clubs'],
    correct: 3
    },
    {
    number: `Question 3`,
    text: `Which of the following tasks is AI going to be the least successful at?`,
    options: ['Summarizing research papers','Writing a personal essay','Explaining to you trigonometry','Creating notes and study sheets'],
    correct: 1
    },
    {
    number: `Question 4`,
    text: `You are using a chatbot for a physics assignment. Which is the most optimal course of action?`,
    options: ['Tell the AI to become a physics expert and complete all the problems','Ask it to clarify concepts you don’t understand','Ask it to format the answers in a short, bullet-point list','Tell it to create a lesson on the concepts in the assignment'],
    correct: 1
    },
    {
    number: `Question 5`,
    text: `Why are open-ended questions powerful for prompting?`,
    options: ['They limit responses to short, direct answers that reduce ambiguity.','They encourage deeper reasoning, explanation, and exploration of multiple perspectives.','They prevent the AI from making mistakes by restricting possible outputs.','They guarantee that the AI will always provide a correct answer.'],
    correct: 1
    },
    {
    number: `Question 6`,
    text: `If AI systems can perform advanced reasoning and writing tasks better than most humans, which ethical concern becomes most significant long-term?`,
    options: ['AI will eliminate all human creativity','Overreliance on AI may erode humans’ ability to develop and practice critical thinking skills','AI systems will become more conscious and learn on its own to fit the needs of its audience','There will be a decreased need for education'],
    correct: 1
    },
    {
    number: `Question 7`,
    text: `A student uses AI on every exam and assignment possible. His teachers are aware, but they don’t do anything about it because it may jeopardize his rank and the school’s reputation. What ethical concern is most significant in this situation?`,
    options: ['The student is adapting to modern technology, and the teachers are supporting innovation','The primary concern is academic dishonesty, regardless of institutional consequences', 'The school’s decision reflects a conflict of interest where reputation and performance metrics are prioritized over educational integrity','The main concern is how students are accessing AI tools in the first place'],
    correct: 2
    },
    {
    number: `Question 8`,
    text: `As AI systems increasingly filter and summarize information for users, what is the primary ethical risk?`,
    options: ['People will stop reading books entirely','AI may centralize control over what knowledge is surfaced or suppressed','AI will replace all search engines to fit the needs of its audience', 'AI responses will be shorter to accommodate for time, as their audience may need it to be efficient'],
    correct: 1
    },
    {
    number: `Question 9`,
    text: `A student uses AI to outline an essay after spending 20 minutes trying and feeling stuck. The student then writes the full essay themselves based on that outline. Which evaluation is the most ethically defensible?`,
    options: ['Whether the student’s original ideas are still present','Whether AI-generated phrasing changes the ownership of expression','Whether the teacher allows AI', 'Whether the final product sounds advanced'],
    correct: 1
    },
    {
    number: `Question 10`,
    text: `A student uses AI to generate a full essay, lightly edits wording, and submits it as their own work without disclosure. The student argues that using AI is no different than using spellcheck. Which ethical concern is most significant?`,
    options: ['AI tools should never be used in school under any circumstances','The student bypassed the learning process and misrepresented authorship','The problem is that the student did not edit the essay into their own words', 'The issue depends solely on whether the teacher does anything about AI usage'],
    correct: 1
    },
    {
    number: `Question 11`,
    text: `What is one way you can verify the information an AI has given you?`,
    options: ['Ask one of your friends to help you','AI can’t be wrong. I’ll just use the information','Reading through the information to see if it sounds reasonable and convincing enough to be true', 'Using credible sources like NASA to verify if the information is true'],
    correct: 3
    },
    {
    number: `Question 12`,
    text: `If an AI provides a summary of a topic and includes specific links or citations to support its claims, can you trust those claims are accurate? What is your immediate next step?`,
    options: ['Its formatting is correct and seems pretty good. No problems here.','You can’t. My next step is to manually go through those links to ensure it exists and supports the information the AI has presented.','Never trust AI. I’ll just stop using it all together.', 'You can’t. My next step is to ask the same AI to verify if the information is true.'],
    correct: 1
    },
    {
    number: `Question 13`,
    text: `Fact checking AI can help reduce misinformation by`,
    options: ['Verifying information with reliable sources and flagging false information on social media platforms','Automatically generating new content to replace all false posts','Eliminating all misinformation without human review', 'Predicting future misinformation trends and preemptively correcting them before they spread'],
    correct: 0
    },
    {
    number: `Question 14`,
    text: `What is not a consequence for not fact checking AI?`,
    options: ['Proliferation of misinformation as fact','Possibility of being rendered punishment in the workplace or school','Hurting your own learning', 'You’ll instantly go to prison'],
    correct: 3
    },
    {
    number: `Question 15`,
    text: `What is true about bias in AI?`,
    options: ['Bias only occurs when an AI provides factually incorrect information','Bias can appear through the selection, emphasis, or omission of information, even if the facts presented are accurate.','Bias is eliminated as long as the AI presents information in a neutral tone.', 'Bias only results from intentional manipulation by programmers.'],
    correct: 1
    }
];

function initQuiz() {
    document.getElementById('start-button').addEventListener('click', startQuiz);
    document.getElementById('prev-button').addEventListener('click', () => changeQuestion(-1));
    document.getElementById('next-button').addEventListener('click', () => changeQuestion(1));
    document.getElementById('submit-button').addEventListener('click', submitQuiz);
    renderQuestion();
}

function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
}

function renderQuestion() {
    const q = questions[currentQuestion];
    document.getElementById('question-number').textContent = q.number;
    document.getElementById('question-text').textContent = q.text;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const id = `q${currentQuestion}_opt${idx}`;
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = idx;
        input.id = id;
        if (answers[currentQuestion] === idx) input.checked = true;
        input.addEventListener('change', () => {
            answers[currentQuestion] = idx;
        });
        label.appendChild(input);
        label.append(` ${opt}`);
        answersDiv.appendChild(label);
        answersDiv.appendChild(document.createElement('br'));
    });

    // navigation state
    document.getElementById('prev-button').disabled = currentQuestion === 0;
    document.getElementById('next-button').style.display = currentQuestion === questions.length -1 ? 'none' : 'inline-block';
    document.getElementById('submit-button').style.display = currentQuestion === questions.length -1 ? 'inline-block' : 'none';
}

function changeQuestion(delta) {
    currentQuestion += delta;
    if (currentQuestion < 0) currentQuestion = 0;
    if (currentQuestion >= questions.length) currentQuestion = questions.length -1;
    renderQuestion();
}

function submitQuiz() {
    // simple scoring: count correct matches
    let score = 0;
    questions.forEach((q,i) => {
        if (answers[i] === q.correct) score++;
    });
    const percent = Math.round((score / questions.length) * 100);
    document.getElementById('score-text').textContent = `You scored ${percent}% (${score}/${questions.length}).`;
    const passText = percent >= 70 ? 'You pass - AI literate! 🎉' : 'You do not pass - more learning needed.';
    document.getElementById('pass-text').textContent = passText;
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    // trigger confetti if user passes
    if (percent >= 70) {
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff1493', '#ff69b4', '#ffffff']
            });
        }, 300);
    }
}