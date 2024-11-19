const terminal = document.getElementById('terminal');
const header = document.getElementById('terminal-header');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - terminal.offsetLeft;
  offsetY = e.clientY - terminal.offsetTop;
  document.body.style.userSelect = 'none'; // Disable text selection while dragging
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate new position
  let newX = e.clientX - offsetX;
  let newY = e.clientY - offsetY;

  // Constrain within bounds
  const terminalWidth = terminal.offsetWidth;
  const terminalHeight = terminal.offsetHeight;

  newX = Math.max(0, Math.min(newX, viewportWidth - terminalWidth));
  newY = Math.max(0, Math.min(newY, viewportHeight - terminalHeight));

  terminal.style.left = `${newX}px`;
  terminal.style.top = `${newY}px`;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = 'auto'; // Re-enable text selection
});
