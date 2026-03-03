// quiz.js - basic quiz framework

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('quiz-page')) {
        initQuiz();
    }
});

let currentQuestion = 0;
let answers = []; // store selected choices by index

// placeholder questions array, 15 items with empty data
const questions = Array.from({length: 15}, (_, i) => ({
    number: `Question ${i+1}`,
    text: `This is the text for question ${i+1}. Replace with actual question content.`,
    options: ['Option A','Option B','Option C','Option D'],
    correct: 0 // dummy, not used until real questions inserted
}));

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
    const passText = percent >= 80 ? 'You pass - AI literate!' : 'You do not pass - more learning needed.';
    document.getElementById('pass-text').textContent = passText;
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
}
