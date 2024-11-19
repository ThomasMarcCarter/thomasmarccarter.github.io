document.addEventListener('DOMContentLoaded', () => {
    // Dynamically create the terminal window when the page loads
    createTerminalWindow();
  
    // Listen for command input from the user
    const terminalInput = document.getElementById('terminal-input');
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const command = terminalInput.value.trim();
        if (command) {
          appendToOutput(`> ${command}`); // Display the command
          handleCommand(command); // Handle the command
        }
        terminalInput.value = ''; // Clear the input field after command is submitted
      }
    });
  });
  
  function createTerminalWindow() {
    const terminalWindow = document.createElement('div');
    terminalWindow.classList.add('window');  // Apply the .window class
    document.body.appendChild(terminalWindow);

    // Create the header
    const header = document.createElement('div');
    header.classList.add('window-header');  // Apply the .window-header class
    terminalWindow.appendChild(header);

    // Create the round buttons (minimize, maximize, close)
    createWindowButtons(header);

    // Create terminal content area
    const terminalContent = document.createElement('div');
    terminalContent.classList.add('window-content');  // Apply the .window-content class
    terminalWindow.appendChild(terminalContent);

    // Create the input area with directory indicator
    const terminalInputContainer = document.createElement('div');
    terminalInputContainer.classList.add('terminal-input-container');
    terminalWindow.appendChild(terminalInputContainer);

    const directoryIndicator = document.createElement('span');
    directoryIndicator.classList.add('directory-indicator');
    directoryIndicator.textContent = '$';  // Or any other symbol like '~'
    terminalInputContainer.appendChild(directoryIndicator);

    const terminalInput = document.createElement('input');
    terminalInput.id = 'terminal-input';
    terminalInput.classList.add('window-input');  // Apply the .window-input class
    terminalInputContainer.appendChild(terminalInput);

    // Append terminal content and input fields
    const output = document.createElement('div');
    output.id = 'output';
    terminalContent.appendChild(output);

    // Add the welcome message and the ">" prompt to the terminal output
    appendToOutput('Welcome to ThomOS');
    appendToOutput('Type "help" for available commands.');

    // Make the terminal window draggable
    makeDraggableAndResizable(terminalWindow, header);

    // Set the terminal to auto-focus
    terminalInput.focus();

    // Make sure the terminal scrolls to the bottom when typing
    terminalInput.addEventListener('input', () => {
      scrollToBottom();
    });
}

  
  // Function to append text to the terminal output
  function appendToOutput(text) {
    const output = document.querySelector('#output');
    const newLine = document.createElement('p');
    newLine.textContent = text;
    output.appendChild(newLine);
    scrollToBottom();
  }
  
// Function to handle commands with a switch-case structure
function handleCommand(command) {
    switch (command.toLowerCase()) {
      case 'hello':
        appendToOutput('Hello, world!');
        break;
      case 'chiwiwis':
        createChiwiwisWindow();  // Call the function to create the chiwiwis window
        appendToOutput('Opening chiwiwis window...');
        break;
      case 'help':
        appendToOutput('Available commands: hello, chiwiwis, help, clear');
        break;
      case 'clear':
        // Clear the terminal output
        const output = document.querySelector('#output');
        output.innerHTML = ''; // Clear the content
        break;
      default:
        appendToOutput(`Command not recognized: ${command}`);
    }
  }
  
  
  // Function to create the chiwiwis window (same as before)
  function createChiwiwisWindow() {
    const chiwiwisWindow = document.createElement('div');
    chiwiwisWindow.classList.add('window');
    document.body.appendChild(chiwiwisWindow);
  
    // Create the header for the chiwiwis window
    const header = document.createElement('div');
    header.classList.add('window-header');
    chiwiwisWindow.appendChild(header);
  
    // Create the round buttons (minimize, maximize, close) for chiwiwis window
    createWindowButtons(header);
  
    // Create the YouTube iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/vVNFEpJ1Mvo?autoplay=1';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 30px)';
    iframe.style.border = 'none';
    chiwiwisWindow.appendChild(iframe);
  
    // Make the chiwiwis window draggable
    makeDraggableAndResizable(chiwiwisWindow, header);
  
    // Close functionality for the close button
    const closeButton = header.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      chiwiwisWindow.remove();
    });
  }
  
  // Function to create the window buttons (minimize, maximize, close)
  function createWindowButtons(headerElement) {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    headerElement.appendChild(buttonContainer);

    const closeButton = document.createElement('div');
    closeButton.classList.add('window-button', 'close-button');
    buttonContainer.appendChild(closeButton);
  
    const minimizeButton = document.createElement('div');
    minimizeButton.classList.add('window-button', 'minimize-button');
    buttonContainer.appendChild(minimizeButton);
  
    const maximizeButton = document.createElement('div');
    maximizeButton.classList.add('window-button', 'maximize-button');
    buttonContainer.appendChild(maximizeButton);
  
    // Add event listeners to buttons
    closeButton.addEventListener('click', () => {
      headerElement.closest('.window').remove();  // Close the window
    });
  
    minimizeButton.addEventListener('click', () => {
      console.log("Minimize button clicked");
    });
  
    maximizeButton.addEventListener('click', () => {
      console.log("Maximize button clicked");
    });
  }
  
  // Function to make the window draggable and resizable
  function makeDraggableAndResizable(windowElement, headerElement) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
  
    // Dragging functionality
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
  
    // Enable resizing
    windowElement.style.resize = 'both';
    windowElement.style.overflow = 'hidden';
  }
  
  // Function to scroll to the bottom of the terminal content
  function scrollToBottom() {
    const terminalContent = document.querySelector('.window-content');
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }
  