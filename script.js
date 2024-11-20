let isTerminalOpen = false; // Flag to track if a terminal is open

document.addEventListener('DOMContentLoaded', () => {

  //add methods here to call on load (new window creation)

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
// Updated WindowBuilder class
class WindowBuilder {
  constructor() {
    this.windowElement = document.createElement('div');
    this.windowElement.classList.add('window');
    document.body.appendChild(this.windowElement);

    // Set random initial position
    this.setRandomPosition();
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

  isDraggable() {
    this.header.addEventListener('mousedown', (e) => {
      let isDragging = true;
      const offsetX = e.clientX - this.windowElement.offsetLeft;
      const offsetY = e.clientY - this.windowElement.offsetTop;

      document.body.style.userSelect = 'none';

      const onMouseMove = (e) => {
        if (!isDragging) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const windowWidth = this.windowElement.offsetWidth;
        const windowHeight = this.windowElement.offsetHeight;

        // Clamp the position to keep the window within the viewport
        newX = Math.max(0, Math.min(newX, viewportWidth - windowWidth));
        newY = Math.max(0, Math.min(newY, viewportHeight - windowHeight));

        this.windowElement.style.left = `${newX}px`;
        this.windowElement.style.top = `${newY}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.body.style.userSelect = 'auto';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    return this;
  }

  isResizable() {
    this.windowElement.style.resize = 'both';
    this.windowElement.style.overflow = 'hidden';
    return this;
  }

  setAsTerminal() {
    this.isTerminal = true;
    return this;
  }

  setRandomPosition() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate centered position
    const centerX = viewportWidth / 2 - this.windowElement.offsetWidth / 2;
    const centerY = viewportHeight / 2 - this.windowElement.offsetHeight / 2;

    // Add random offsets within a range
    const randomOffsetX = Math.random() * 50 - 25;
    const randomOffsetY = Math.random() * 50 - 25;

    // Set window position
    this.windowElement.style.position = 'absolute';
    this.windowElement.style.left = `${centerX + randomOffsetX}px`;
    this.windowElement.style.top = `${centerY + randomOffsetY}px`;
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
    .isDraggable()
    .isResizable()
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
// create education window
function createEducationWindow() {
  const educationHeader = document.createElement('h1');
  educationHeader.textContent = "Education";

  new WindowBuilder()
    .setHeader("Education")
    .addContent(educationHeader)
    .hasButtons()
    .isDraggable()
    .isResizable();
}
//snake time lol 
function createSnakeWindow() {
  const snakeCanvas = document.createElement('canvas');
  snakeCanvas.id = 'board';
  snakeCanvas.style.width = '100%';
  snakeCanvas.style.height = '100%';

  // Create the Snake game window
  new WindowBuilder()
    .setHeader('Snake Game')
    .addContent(snakeCanvas)
    .isDraggable()
    .hasButtons();

  // Initialize Snake game variables
  const blockSize = 25;
  const totalRow = 17;
  const totalCol = 17;

  let snakeX = blockSize * 5;
  let snakeY = blockSize * 5;

  let speedX = 0;
  let speedY = 0;

  let snakeBody = [];
  let foodX;
  let foodY;
  let gameOver = false;

  const board = snakeCanvas;
  const context = board.getContext('2d');

  // Set the board dimensions
  board.width = totalCol * blockSize;
  board.height = totalRow * blockSize;

  // Function to place food randomly
  function placeFood() {
    foodX = Math.floor(Math.random() * totalCol) * blockSize;
    foodY = Math.floor(Math.random() * totalRow) * blockSize;
  }

  // Function to handle the game update
  function update() {
    if (gameOver) return;

    // Clear the board
    context.fillStyle = 'green';
    context.fillRect(0, 0, board.width, board.height);

    // Draw food
    context.fillStyle = 'yellow';
    context.fillRect(foodX, foodY, blockSize, blockSize);

    // Snake eats food
    if (snakeX === foodX && snakeY === foodY) {
      snakeBody.push([foodX, foodY]);
      placeFood();
    }

    // Move snake body
    for (let i = snakeBody.length - 1; i > 0; i--) {
      snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length) {
      snakeBody[0] = [snakeX, snakeY];
    }

    // Update snake position
    snakeX += speedX * blockSize;
    snakeY += speedY * blockSize;

    // Draw snake
    context.fillStyle = 'white';
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
      context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Check for collisions
    if (
      snakeX < 0 ||
      snakeX >= board.width ||
      snakeY < 0 ||
      snakeY >= board.height
    ) {
      gameOver = true;
      alert('Game Over!');
      return;
    }

    // Check if snake collides with itself
    for (let i = 0; i < snakeBody.length; i++) {
      if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
        gameOver = true;
        alert('Game Over!');
        return;
      }
    }
  }

  // Function to change snake direction
  function changeDirection(e) {
    if (e.code === 'ArrowUp' && speedY !== 1) {
      speedX = 0;
      speedY = -1;
    } else if (e.code === 'ArrowDown' && speedY !== -1) {
      speedX = 0;
      speedY = 1;
    } else if (e.code === 'ArrowLeft' && speedX !== 1) {
      speedX = -1;
      speedY = 0;
    } else if (e.code === 'ArrowRight' && speedX !== -1) {
      speedX = 1;
      speedY = 0;
    }
  }

  // Initialize the game
  placeFood();
  document.addEventListener('keydown', changeDirection);
  const gameInterval = setInterval(update, 100);

  // Cleanup event listeners and intervals when the window is closed
  const closeButton = snakeCanvas.closest('.window').querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    clearInterval(gameInterval);
    document.removeEventListener('keydown', changeDirection);
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
    .isDraggable()
    .isResizable();
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
      appendToOutput('Available commands: hello, chiwiwis, help, clear, education, snake');
      break;
    case 'clear':
      const output = document.querySelector('#output');
      output.innerHTML = '';
      appendToOutput('\n\n')
      break;
    case 'education':
      createEducationWindow();
      appendToOutput("Opening Education...")
      break;
    case 'snake':
      createSnakeWindow();
      appendToOutput("Lets play!");
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
