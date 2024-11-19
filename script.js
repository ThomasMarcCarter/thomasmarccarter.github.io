const terminal = document.getElementById('terminal');
const header = document.getElementById('terminal-header');

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - terminal.offsetLeft;
  offsetY = e.clientY - terminal.offsetTop;
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  terminal.style.left = `${e.clientX - offsetX}px`;
  terminal.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.userSelect = 'auto';
});
