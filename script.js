const terminal = document.getElementById('terminal');
const header = document.getElementById('terminal-header');
const terminalInput = document.getElementById('terminal-input');
const output = document.getElementById('output');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Dragging functionality
header.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - terminal.offsetLeft;
  offsetY = e.clientY - terminal.offsetTop;
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let newX = e.clientX - offsetX;
  let newY = e.clientY - offsetY;

  const terminalWidth = terminal.offsetWidth;
  const terminalHeight = terminal.offsetHeight;

  newX = Math.max(0, Math.min(newX, viewportWidth - terminalWidth));
  newY = Math.max(0, Math.min(newY, viewportHeight - terminalHeight));

  terminal.style.left = `${newX}px`;
  terminal.style.top = `${newY}px`;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = 'auto';
});

// Input functionality
terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const command = terminalInput.value.trim();
    if (command) {
      appendToOutput(`> ${command}`);
      handleCommand(command);
    }
    terminalInput.value = '';
  }
});

function appendToOutput(text) {
  const line = document.createElement('p');
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
}

function handleCommand(command) {
  // Simple commands for demonstration
  switch (command.toLowerCase()) {
    case 'help':
      appendToOutput('Available commands: help, about, clear');
      break;
    case 'about':
      appendToOutput('This is an interactive portfolio terminal.');
      break;
    case 'clear':
      output.innerHTML = '';
      break;
    default:
      appendToOutput(`Unknown command: ${command}`);
  }
}
