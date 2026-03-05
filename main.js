// index.js - global page scripts
document.addEventListener('DOMContentLoaded', () => {
	runTypewriter();
});

function runTypewriter() {
	const container = document.querySelector('.head-container h1');
	if (!container) return;
	const text = 'Welcome to Verity';
	container.textContent = '';
	container.setAttribute('aria-live', 'polite');
	let i = 0;
	const speed = 80; // ms per char
	const cursor = document.createElement('span');
	cursor.className = 'type-cursor';
	cursor.textContent = '|';
	container.appendChild(cursor);

	function type() {
		if (i < text.length) {
			// insert character before cursor, with color for "Verity"
			const char = text.charAt(i);
			const wordStart = text.indexOf('Verity');
			const wordEnd = wordStart + 'Verity'.length;
			let span = document.createElement('span');
			span.textContent = char;
			// if current char is part of "Verity", make it pink
			if (i >= wordStart && i < wordEnd) {
				span.style.color = '#ff1493';
			}
			cursor.insertAdjacentElement('beforebegin', span);
			i++;
			setTimeout(type, speed);
		} else {
			// stop cursor blink after finished
			cursor.classList.add('done');
		}
	}

	type();
}

