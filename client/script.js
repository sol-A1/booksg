const form = document.querySelector('form');
const chatContainer = document.getElementById('chat-container');

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const chatStripe = (isBot, text, id, isLoading = false) => {
  const stripeClass = isBot ? 'bot-stripe' : 'user-stripe';
  const name = isBot ? ' ' : ' ';
  const uniqueId = id ? `id="${id}"` : '';
  const textClass = isBot ? 'bot-text' : 'user-text';

  let messageText = text;
  if (isLoading && !text) {
    messageText = '';
  }

  return `
    <div class="stripe ${stripeClass}">
      <div class="avatar">${name[0]}</div>
      <div class="text" ${uniqueId}>
        <div class="${textClass}">${messageText}</div>
        ${isLoading ? '<div class="loader"></div>' : ''}
      </div>
      <div class="gap"></div>
    </div>
  `;
};

const clearChatContainer = () => {
  chatContainer.innerHTML = '';
};

clearChatContainer();

const typeText = (messageDiv, text) => {
  const charsPerInterval = 5;
  const lines = text.split('\n').filter(Boolean); // Split text into individual lines
  let currentLine = 0;

  const intervalId = setInterval((lines) => {
    if (currentLine < lines.length) {
      const line = lines[currentLine];
      if (line.trim().startsWith("Overview:")) {
        messageDiv.querySelector('.bot-text').innerHTML += `<br />\n<b>${line}</b><br />\n`; // Add bold tags to Explanation
        messageDiv.querySelector('.bot-text').innerHTML += '<br />\n'; // Add line break
      } else if (line.trim().startsWith("Key Takeaways:")) {
        messageDiv.querySelector('.bot-text').innerHTML += `<br />\n<b>${line}</b><br />\n`; // Add bold tags to Decision
        messageDiv.querySelector('.bot-text').innerHTML += '<br />\n'; // Add line break
      } else if (line.trim().startsWith("-")) {
        messageDiv.querySelector('.bot-text').innerHTML += `${line}<br />\n`; // Add bullet point
      } else {
        messageDiv.querySelector('.bot-text').innerHTML += `${line}<br />\n`; // Add line break
      }
      currentLine += 1;
    } else {
      clearInterval(intervalId);
    }
  }, 50, lines);

  const loaderIntervalId = loader(messageDiv);

  setTimeout(() => {
    clearInterval(intervalId);
    clearInterval(loaderIntervalId);
    messageDiv.querySelector('.loader').style.display = 'none'; // hide the loader div
  }, lines.length * 50);
};




const handleSubmit = async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const skills = formData.get('skills');
  const balance = formData.get('balance');

  clearChatContainer();

  // loading stripe
  const loadingStripe = chatStripe(true, 'Loading...', null, true);
  chatContainer.innerHTML += loadingStripe;

  const response = await fetch('http://localhost:5003', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      skills: skills,
      balance: balance,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'
    const uniqueId = generateUniqueId();
    
  const botStripe = chatStripe(true, '', uniqueId, true);
    chatContainer.innerHTML += botStripe;

    const messageDiv = document.getElementById(uniqueId);
    typeText(messageDiv, parsedData);
  } else {
    const userStripe = chatStripe(false, `${skills}`);

    chatContainer.innerHTML += userStripe;
    chatContainer.scrollTop = chatContainer.scrollHeight;
    alert('Something went wrong');
  }

  const loader = (messageDiv) => {
    let count = 0;
    const loaderId = setInterval(() => {
      messageDiv.querySelector('.loader').innerHTML = '.'.repeat(count % 4);
      count++;
    }, 300);
  
    return loaderId;
  };
  
};
  
  form.addEventListener('submit', handleSubmit);