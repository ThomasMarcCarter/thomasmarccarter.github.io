// WindowBuilder.js
class WindowBuilder {
    constructor(title = 'New Window') {
      this.window = document.createElement('div');
      this.window.classList.add('window');
  
      // Add header
      this.header = document.createElement('div');
      this.header.classList.add('window-header');
      this.header.textContent = title;
      this.window.appendChild(this.header);
  
      // Content container
      this.content = document.createElement('div');
      this.content.classList.add('window-content');
      this.window.appendChild(this.content);
    }
  
    hasButtons() {
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');
      this.header.appendChild(buttonContainer);
  
      const closeButton = document.createElement('div');
      closeButton.classList.add('window-button', 'close-button');
      buttonContainer.appendChild(closeButton);
  
      closeButton.addEventListener('click', () => {
        this.window.remove();
      });
  
      return this; // Enable chaining
    }
  
    isDraggableAndResizable() {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;
  
      this.header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - this.window.offsetLeft;
        offsetY = e.clientY - this.window.offsetTop;
        document.body.style.userSelect = 'none';
      });
  
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
  
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
  
        this.window.style.left = `${newX}px`;
        this.window.style.top = `${newY}px`;
      });
  
      document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = 'auto';
      });
  
      this.window.style.resize = 'both';
      this.window.style.overflow = 'hidden';
  
      return this; // Enable chaining
    }
  
    addIframe(src) {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = 'calc(100% - 30px)';
      iframe.style.border = 'none';
      this.content.appendChild(iframe);
  
      return this; // Enable chaining
    }
  
    render() {
      document.body.appendChild(this.window);
    }
  }
  
  export default WindowBuilder;
  