// chiwiwis.js
export function createChiwiwisWindow() {
    const chiwiwisWindow = new WindowBuilder('Chiwiwis Window');
    chiwiwisWindow.addIframe('https://www.youtube.com/embed/vVNFEpJ1Mvo?autoplay=1')
                  .hasButtons()
                  .isDraggableAndResizable()
                  .render();
  }
  