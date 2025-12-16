(function() {
  'use strict';

  function splitIntoLetters(element) {
    const originalText = element.textContent;
    const letters = originalText.split('');

    element.innerHTML = letters.map(letter => {
      if (letter === ' ') {
        return ' ';
      }
      return `<span class="site-title-letter">${letter}</span>`;
    }).join('');
  }

  function initAnimation() {
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
      splitIntoLetters(link);
    });

    const allLetters = document.querySelectorAll('.site-title-letter');

    function vibrateRandomLetter() {
      if (allLetters.length === 0) return;

      const randomIndex = Math.floor(Math.random() * allLetters.length);
      const letter = allLetters[randomIndex];

      letter.classList.add('vibrating');

      setTimeout(() => {
        letter.classList.remove('vibrating');
      }, 800);
    }

    function startRandomVibrations() {
      vibrateRandomLetter();

      setTimeout(startRandomVibrations, 250);
    }

    setTimeout(startRandomVibrations, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimation);
  } else {
    initAnimation();
  }
})();
