// main.js
import { createChiwiwisWindow } from './chiwiwis.js';
import WindowBuilder from './WindowBuilder.js';

let isTerminalOpen = false;

document.addEventListener('DOMContentLoaded', () => {
  // Handle terminal icon click
  const terminalIcon = document.getElementById('terminal-icon');
  terminalIcon.addEventListener('click', () => {
    if (!isTerminalOpen) {
      createTerminalWindow();
      isTerminalOpen = true;
    }
  });
});

function createTerminalWindow() {
  const terminalWindow = new WindowBuilder('Terminal')
    .hasButtons()
    .isDraggableAndResizable();

  const inputContainer = document.createElement('div');
  inputContainer.classList.add('terminal-input-container');

  const directoryIndicator = document.createElement('span');
  directoryIndicator.classList.add('directory-indicator');
  directoryIndicator.textContent = '$';
  inputContainer.appendChild(directoryIndicator);

  const input = document.createElement('input');
  input.id = 'terminal-input';
  input.classList.add('window-input');
  inputContainer.appendChild(input);

  terminalWindow.content.appendChild(inputContainer);

  terminalWindow.render();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleCommand(input.value.trim());
      input.value = '';
    }
  });

  const closeButton = terminalWindow.header.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    isTerminalOpen = false;
  });
}

function handleCommand(command) {
  switch (command.toLowerCase()) {
    case 'hello':
      appendToOutput('Hello, world!');
      break;
    case 'chiwiwis':
      createChiwiwisWindow();
      appendToOutput('Opening chiwiwis window...');
      break;
    case 'help':
      appendToOutput('Available commands: hello, chiwiwis, help, clear');
      break;
    case 'clear':
      document.getElementById('output').innerHTML = '';
      break;
    default:
      appendToOutput(`Command not recognized: ${command}`);
  }
}

function appendToOutput(text) {
  const output = document.getElementById('output');
  if (!output) return;
  const newLine = document.createElement('p');
  newLine.textContent = text;
  output.appendChild(newLine);
}
