document.addEventListener('DOMContentLoaded', () => {
    const wordsUrl = 'data/words.json';
    let words = [];
    let currentQuestion = null;
    let isAnswering = false;

    const loadingEl = document.getElementById('loading');
    const questionAreaEl = document.getElementById('question-area');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainerEl = document.getElementById('options-container');
    const feedbackAreaEl = document.getElementById('feedback-area');
    const errorEl = document.getElementById('error-message');

    // Fetch data
    fetch(wordsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            words = data;
            if (words.length < 4) {
                throw new Error('Not enough words to generate options');
            }
            loadingEl.classList.add('hidden');
            questionAreaEl.classList.remove('hidden');
            loadNewQuestion();
        })
        .catch(error => {
            console.warn('Fetch failed, attempting fallback to local data:', error);
            if (typeof LOCAL_DATA !== 'undefined') {
                words = LOCAL_DATA;
                loadingEl.classList.add('hidden');
                questionAreaEl.classList.remove('hidden');
                loadNewQuestion();
            } else {
                console.error('Error loading words and no local fallback:', error);
                loadingEl.classList.add('hidden');
                errorEl.classList.remove('hidden');
            }
        });

    function loadNewQuestion() {
        isAnswering = true;
        feedbackAreaEl.textContent = '';
        feedbackAreaEl.className = 'feedback-message hidden';

        // Pick a random word as the correct answer
        const correctIndex = Math.floor(Math.random() * words.length);
        const correctWord = words[correctIndex];

        // Pick 3 distinct distractors
        const distractors = [];
        while (distractors.length < 3) {
            const randomIndex = Math.floor(Math.random() * words.length);
            if (randomIndex !== correctIndex && !distractors.includes(words[randomIndex])) {
                distractors.push(words[randomIndex]);
            }
        }

        // Combine and shuffle options
        const options = [correctWord, ...distractors];
        shuffleArray(options);

        currentQuestion = {
            correct: correctWord,
            options: options
        };

        renderQuestion();
    }

    function renderQuestion() {
        questionTextEl.textContent = currentQuestion.correct.meaning;
        optionsContainerEl.innerHTML = '';

        currentQuestion.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.word;
            btn.addEventListener('click', () => handleOptionClick(btn, option));
            optionsContainerEl.appendChild(btn);
        });
    }

    function handleOptionClick(btn, selectedOption) {
        if (!isAnswering) return;
        isAnswering = false; // Prevent multiple clicks

        const isCorrect = selectedOption.word === currentQuestion.correct.word;

        // Visual feedback
        if (isCorrect) {
            btn.classList.add('correct');
            feedbackAreaEl.textContent = 'Correct!';
            feedbackAreaEl.style.color = 'var(--success-color)';
        } else {
            btn.classList.add('incorrect');
            feedbackAreaEl.textContent = `Incorrect. The answer was ${currentQuestion.correct.word}.`;
            feedbackAreaEl.style.color = 'var(--error-color)';

            // Highlight the correct answer
            const buttons = optionsContainerEl.querySelectorAll('.option-btn');
            buttons.forEach(b => {
                if (b.textContent === currentQuestion.correct.word) {
                    b.classList.add('correct');
                }
            });
        }

        feedbackAreaEl.classList.remove('hidden');

        // Load next question after a short delay
        setTimeout(() => {
            loadNewQuestion();
        }, 1500);
    }

    // Fisher-Yates shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});
