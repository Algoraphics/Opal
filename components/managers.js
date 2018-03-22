/* global AFRAME, THREE, beat, bind, Uint8Array, isMobile, checkHeadsetConnected */

var debug = false;

/*
  Manage camera state. Accept input signals from menu to determine whether camera should really move.
  Configurable start, stop, and location at which it will slowly rise up.
*/
AFRAME.registerComponent('camera-manager', {
  init: function () {
    var el = this.el;
    
    // Use regular look controls for VR. Custom look controls don't work. Codebase is inconsistent.
    if (el.getAttribute('id') == 'camera') {
      if (checkHeadsetConnected()) {
        if (isMobile()) {
          el.setAttribute('position', '0 0 0');
        }
        else {
          el.setAttribute('look-controls','');
          el.setAttribute('position', '0 0 0');
        }
      }
      else {
        el.setAttribute('my-look-controls', '');
      }
    }
    // Only the main camera manager should have freedom of movement in debug mode
    if (debug) {
      this.el.sceneEl.setAttribute('stats', '');
      document.querySelector('#click-instruction').setAttribute('visible', true);
      this.el.setAttribute('wasd-controls', "acceleration: 1500; fly: true");
    }
  },
  
});