document.addEventListener('DOMContentLoaded', () => {
    // Dynamically create the terminal window when the page loads
    createTerminalWindow();
  
    // Listen for command input from the user
    const terminalInput = document.getElementById('terminal-input');
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
  });
  
  // Function to create the terminal window
  function createTerminalWindow() {
    const terminalWindow = document.createElement('div');
    terminalWindow.classList.add('terminal-window');
    document.body.appendChild(terminalWindow);
  
    // Create the terminal header
    const header = document.createElement('div');
    header.classList.add('terminal-header');
    terminalWindow.appendChild(header);
  
    // Create the round buttons (minimize, maximize, close)
    createWindowButtons(header);
  
    // Create terminal content area (where output is displayed)
    const terminalContent = document.createElement('div');
    terminalContent.classList.add('terminal-content');
    terminalWindow.appendChild(terminalContent);
  
    // Create the input area
    const terminalInput = document.createElement('input');
    terminalInput.id = 'terminal-input';
    terminalInput.classList.add('terminal-input');
    terminalWindow.appendChild(terminalInput);
  
    // Append terminal content and input fields
    const output = document.createElement('div');
    output.id = 'output';
    terminalContent.appendChild(output);
  
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
    const output = document.getElementById('output');
    const line = document.createElement('p');
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom(); // Auto-scroll to the bottom
  }
  
  // Function to handle commands
  function handleCommand(command) {
    switch (command.toLowerCase()) {
      case 'help':
        appendToOutput('Available commands: help, about, clear, chiwiwis');
        break;
      case 'about':
        appendToOutput('This is an interactive portfolio terminal.');
        break;
      case 'clear':
        document.getElementById('output').innerHTML = '';
        break;
      case 'chiwiwis':
        createChiwiwisWindow();  // Handle the chiwiwis command
        break;
      default:
        appendToOutput(`Unknown command: ${command}`);
    }
  }
  
  // Function to create the chiwiwis window
  function createChiwiwisWindow() {
    const chiwiwisWindow = document.createElement('div');
    chiwiwisWindow.classList.add('chiwiwis-window');
    document.body.appendChild(chiwiwisWindow);
  
    // Create the header for the chiwiwis window
    const header = document.createElement('div');
    header.classList.add('chiwiwis-header');
    chiwiwisWindow.appendChild(header);
  
    // Create the round buttons (minimize, maximize, close) for chiwiwis window
    createWindowButtons(header);
  
    // Create the YouTube iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/vVNFEpJ1Mvo?autoplay=1'; // Replace with your YouTube video URL
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = 'calc(100% - 30px)'; // Adjust height to exclude header
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
  
    const minimizeButton = document.createElement('div');
    minimizeButton.classList.add('window-button', 'minimize-button');
    buttonContainer.appendChild(minimizeButton);
  
    const maximizeButton = document.createElement('div');
    maximizeButton.classList.add('window-button', 'maximize-button');
    buttonContainer.appendChild(maximizeButton);
  
    const closeButton = document.createElement('div');
    closeButton.classList.add('window-button', 'close-button');
    buttonContainer.appendChild(closeButton);
  
    // Add event listeners to buttons
    closeButton.addEventListener('click', () => {
      // Close functionality: remove the window when close button is clicked
      headerElement.closest('.terminal-window, .chiwiwis-window').remove();
    });
  
    minimizeButton.addEventListener('click', () => {
      // Minimize functionality: add your logic here
      console.log("Minimize button clicked");
    });
  
    maximizeButton.addEventListener('click', () => {
      // Maximize functionality: add your logic here
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
  
  // Scroll to the bottom of the terminal content
  function scrollToBottom() {
    const terminalContent = document.querySelector('.terminal-content');
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }
  