(() => {
      // --- JSON Data of Questions and Answers ---
      const qaData = [
        { question: "Hii", content: "Hello! I'm Health Care Chatbot.<br>Ask me anything from my knowledge base." },
        { question: "What is the symptom of flu?", content: "Common symptoms of the flu include fever, sore throat, cough, fatigue, and body aches. If you have these symptoms, you may want to see a doctor." },
        { question: "What is Acne?", content: "Acne is a common skin condition where hair follicles become clogged with oil and dead skin cells, leading to pimples, blackheads, or whiteheads, often on the face, chest, and back." },
        { question: "only in male or female", content: "Acne affects both males and females. However, it can be more severe in males due to higher levels of androgens, while females may experience acne linked to hormonal changes, especially during menstruation or pregnancy." },
        { question: "what is migrain?", content: "Migraine is a severe headache often on one side of the head, with symptoms like nausea, vomiting, light sensitivity, and visual disturbances, lasting hours to days, affecting daily activities." },
        { question: "Thank you", content: "You're very welcome! Ask me anything else if you'd like." }
      ];

      // --- DOM elements ---
      const chatHistory = document.getElementById('chat-history');
      const inputTextarea = document.getElementById('input-textarea');
      const sendButton = document.getElementById('send-button');
      const scrollBtn = document.getElementById('scroll-to-bottom');

      // --- Utility Functions ---

      /**
       * Scroll chat to bottom smoothly
       */
      function scrollChatToBottom() {
        chatHistory.scrollTo({ top: chatHistory.scrollHeight, behavior: 'smooth' });
      }

      /**
       * Append message to chat window
       * @param {string} text - The message text (may contain minimal HTML)
       * @param {'user'|'bot'} sender - Message sender
       */
      function appendMessage(text, sender) {
        const msgEl = document.createElement('div');
        msgEl.classList.add('message', sender);
        if (sender === 'bot') {
          msgEl.innerHTML = text;
        } else {
          // For user, sanitize to plain text
          msgEl.textContent = text;
        }
        chatHistory.appendChild(msgEl);
        scrollChatToBottom();
      }

      /**
       * Show "bot is typing" animation message
       * @returns HTMLElement of typing indicator
       */
      function showTypingIndicator() {
        const typingEl = document.createElement('div');
        typingEl.classList.add('message', 'bot');
        typingEl.setAttribute('aria-live', 'polite');
        typingEl.innerHTML = `
          <span class="typing" aria-label="Bot is typing">
            <span></span><span></span><span></span>
          </span>
        `;
        chatHistory.appendChild(typingEl);
        scrollChatToBottom();
        return typingEl;
      }

      /**
       * Remove an element from chat history
       * @param {HTMLElement} element 
       */
      function removeElement(element) {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }

      /**
       * Basic normalization of text for comparison
       * @param {string} text 
       * @returns {string}
       */
      function normalizeText(text) {
        return text.trim().toLowerCase();
      }

      /**
       * Find best matching answer based on simple keyword matching
       * @param {string} question User's question
       * @returns {string} Corresponding answer or fallback message
       */
      function findAnswer(question) {
        const normalizedQuestion = normalizeText(question);
        let bestMatch = null;
        let highestScore = 0;

        for (const qa of qaData) {
          const qNormalized = normalizeText(qa.question);
          const qWords = qNormalized.split(/\W+/).filter(Boolean);
          const questionWords = normalizedQuestion.split(/\W+/).filter(Boolean);

          // Count matching words between user input and JSON question
          let currentScore = 0;
          for (const w of questionWords) {
            if (qWords.includes(w) && w.length > 2) {
              currentScore++;
            }
          }
          if (currentScore > highestScore) {
            highestScore = currentScore;
            bestMatch = qa;
          }
        }

        if (highestScore === 0 || !bestMatch) {
          return `<em>Sorry, I couldn't find an answer. Please try rephrasing your question.</em>`;
        }
        return bestMatch.content;
      }

      /**
       * Auto-grow textarea height to fit text
       */
      function autoGrowTextarea() {
        inputTextarea.style.height = 'auto';
        inputTextarea.style.height = (inputTextarea.scrollHeight) + 'px';
      }

      /**
       * Enable or disable send button based on textarea content
       */
      function toggleSendButton() {
        const trimmed = inputTextarea.value.trim();
        sendButton.disabled = trimmed.length === 0;
      }

      /**
       * Handler to submit user question
       * @param {Event} e 
       */
      function handleSubmit(e) {
        e.preventDefault();

        const userText = inputTextarea.value.trim();
        if (userText.length === 0) {
          return;
        }

        appendMessage(userText, 'user');
        inputTextarea.value = '';
        autoGrowTextarea();
        toggleSendButton();

        const typingIndicator = showTypingIndicator();

        // Simulate bot typing delay with progressive reveal
        let waitTime = 700 + Math.min(userText.length * 45, 2500);

        setTimeout(() => {
          removeElement(typingIndicator);
          const answer = findAnswer(userText);
          appendMessage(answer, 'bot');
        }, waitTime);
      }

      /**
       * Handler to detect scroll position and toggle scroll-to-bottom button
       */
      function handleScroll() {
        const distanceFromBottom = chatHistory.scrollHeight - chatHistory.clientHeight - chatHistory.scrollTop;
        if(distanceFromBottom > 120) {
          scrollBtn.hidden = false;
          scrollBtn.classList.add('visible');
        } else {
          scrollBtn.classList.remove('visible');
          scrollBtn.hidden = true;
        }
      }

      /**
       * Smooth scroll to bottom on button click
       */
      function scrollToLatest() {
        scrollChatToBottom();
        scrollBtn.classList.remove('visible');
        scrollBtn.hidden = true;
        inputTextarea.focus();
      }

      // --- Event Listeners ---
      inputTextarea.addEventListener('input', () => {
        autoGrowTextarea();
        toggleSendButton();
      });

      sendButton.addEventListener('click', () => {
        if(!sendButton.disabled) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });

      // Handle Enter key in textarea - submit on Ctrl+Enter or Shift+Enter or normal Enter
      inputTextarea.addEventListener('keydown', e => {
        // If Shift+Enter, insert newline
        if(e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
          return;
        }
        // If Enter without modifiers, submit
        if(e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          if(!sendButton.disabled) {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
          }
        }
      });

      chatHistory.addEventListener('scroll', handleScroll);
      scrollBtn.addEventListener('click', scrollToLatest);

      // Initialization
      const form = document.querySelector('footer form') || (() => {
        // Create a dummy form for preventDefault on submit
        const f = document.createElement('form');
        f.addEventListener('submit', handleSubmit);
        document.querySelector('footer').appendChild(f);
        return f;
      })();

      form.removeEventListener('submit', handleSubmit);
      form.addEventListener('submit', handleSubmit);

      // Initial greeting
    //   appendMessage();
    //   autoGrowTextarea();
    //   toggleSendButton();

      // Accessibility: focus input on page load
      window.addEventListener('load', () => {
        inputTextarea.focus();
      });
    })();
  

