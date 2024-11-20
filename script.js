let isTerminalOpen = false; // Flag to track if a terminal is open

document.addEventListener('DOMContentLoaded', () => {

createTerminalWindow();
  // listen for terminal icon
  const terminalIcon = document.getElementById('terminal-icon');
  terminalIcon.addEventListener('click', () => {
    if (!isTerminalOpen) {
      createTerminalWindow();
    }
  });
});

// Class to encapsulate window creation and management
class WindowBuilder {
  constructor() {
    this.windowElement = document.createElement('div');
    this.windowElement.classList.add('window');
    document.body.appendChild(this.windowElement);
  }

  setHeader(title = '') {
    const header = document.createElement('div');
    header.classList.add('window-header');
    this.windowElement.appendChild(header);

    if (title) {
      const titleLabel = document.createElement('span');
      titleLabel.classList.add('window-title');
      titleLabel.textContent = title;
      header.appendChild(titleLabel);
    }

    this.header = header;
    return this;
  }

  addContent(contentElement) {
    const content = document.createElement('div');
    content.classList.add('window-content');
    content.appendChild(contentElement);
    this.windowElement.appendChild(content);
    return this;
  }

  hasButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    this.header.appendChild(buttonContainer);

    const closeButton = document.createElement('div');
    closeButton.classList.add('window-button', 'close-button');
    buttonContainer.appendChild(closeButton);

    const minimizeButton = document.createElement('div');
    minimizeButton.classList.add('window-button', 'minimize-button');
    buttonContainer.appendChild(minimizeButton);

    const maximizeButton = document.createElement('div');
    maximizeButton.classList.add('window-button', 'maximize-button');
    buttonContainer.appendChild(maximizeButton);

    // Close button functionality
    closeButton.addEventListener('click', () => {
      this.windowElement.remove();
      if (this.isTerminal) isTerminalOpen = false; // Reset flag for terminal
    });

    return this;
  }

  isDraggableAndResizable() {
    makeDraggableAndResizable(this.windowElement, this.header);
    this.windowElement.style.resize = 'both';
    this.windowElement.style.overflow = 'hidden';
    return this;
  }

  setAsTerminal() {
    this.isTerminal = true;
    return this;
  }
}

// Function to create the terminal window
function createTerminalWindow() {
  const terminalInputContainer = document.createElement('div');
  terminalInputContainer.classList.add('terminal-input-container');

  const directoryIndicator = document.createElement('span');
  directoryIndicator.classList.add('directory-indicator');
  directoryIndicator.textContent = '$';
  terminalInputContainer.appendChild(directoryIndicator);

  const terminalInput = document.createElement('input');
  terminalInput.id = 'terminal-input';
  terminalInput.classList.add('window-input');
  terminalInputContainer.appendChild(terminalInput);

  const output = document.createElement('div');
  output.id = 'output';

  // Use the WindowBuilder to create and structure the terminal window
  new WindowBuilder()
    .setHeader('Terminal') // Add terminal title
    .addContent(output)
    .addContent(terminalInputContainer) // The input container will always stay at the bottom
    .hasButtons()
    .isDraggableAndResizable()
    .setAsTerminal();

  // Set the terminal open flag to true
  isTerminalOpen = true;

  appendToOutput('\n \nWelcome to ThomOS');
  appendToOutput('Type "help" for available commands.');

  terminalInput.focus();
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
}

function createChiwiwisWindow() {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/vVNFEpJ1Mvo?autoplay=1';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.style.width = '100%';
  iframe.style.height = 'calc(100% - 30px)';
  iframe.style.border = 'none';

  new WindowBuilder()
    .setHeader('Chiwiwis')
    .addContent(iframe)
    .hasButtons()
    .isDraggableAndResizable();
}

// Function to append text to the terminal output
function appendToOutput(text) {
  const output = document.querySelector('#output');
  const newLine = document.createElement('p');
  newLine.textContent = text;
  output.appendChild(newLine);
  scrollToBottom();
}

// Function to handle terminal commands
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
      const output = document.querySelector('#output');
      output.innerHTML = '';
      appendToOutput('\n\n')
      break;
    default:
      appendToOutput(`Command not recognized: ${command}`);
  }
}

// Function to scroll to the bottom of the terminal content
function scrollToBottom() {
  const terminalContent = document.querySelector('.window-content');
  terminalContent.scrollTop = terminalContent.scrollHeight;
}

// Function to make windows draggable and resizable
function makeDraggableAndResizable(windowElement, headerElement) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  headerElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - windowElement.offsetLeft;
    offsetY = e.clientY - windowElement.offsetTop;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    const windowWidth = windowElement.offsetWidth;
    const windowHeight = windowElement.offsetHeight;

    newX = Math.max(0, Math.min(newX, viewportWidth - windowWidth));
    newY = Math.max(0, Math.min(newY, viewportHeight - windowHeight));

    windowElement.style.left = `${newX}px`;
    windowElement.style.top = `${newY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = 'auto';
  });
}
