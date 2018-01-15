/* global AFRAME, THREE, beat */

function rotato(el) {
  var rotationTmp = this.rotationTmp = this.rotationTmp || {x: 0, y: 0, z: 0};
  var rotation = el.getAttribute('rotation');
  rotationTmp.x = rotation.x;
  rotationTmp.y = rotation.y + 0.5;
  rotationTmp.z = rotation.z;
  el.setAttribute('rotation', rotationTmp);
}

AFRAME.registerComponent('glcube', {
  init: function () {
    //var plane = new THREE.PlaneBufferGeometry(1, 2);

    var cube2 = new THREE.CubeGeometry(1, 0.25, 0.5);
    var data = this.data;
    var material = new THREE.MeshBasicMaterial( {color: 0x0000FF, wireframe: false});
    var scene = this.el.sceneEl.object3D;

    for (var i = 0; i < 16; i++) {
      var cube = new THREE.CubeGeometry(0.5, 0.5, 0.5);
      var mesh = new THREE.Mesh(cube, material);
      var entity = document.createElement('a-entity');
      var mat = new THREE.MeshBasicMaterial( {color: 0x0000FF, wireframe: false});

      entity.setAttribute('mixin', "cubes");
      entity.setAttribute('animation__color', "property: material.color; dir: alternate; dur: 3000; easing: easeInSine; loop: true; to: rgb(0, 250, 0)");
      //entity.setAttribute('animation__yoyo', "property: position; dir: alternate; dur: 1000; easing: easeInSine; loop: true; to: 0 " + i + " 0");
      //entity.setAttribute('animation__scale', "property: scale; dir: alternate; dur: 200; easing: easeInSine; loop: true; to: 1.2 1 1.2");
      this.el.appendChild(entity);
    }
    //child.setAttribute("position", {x: 4});

  },
  tick: function () {
    rotato(this.el);
  }
});

AFRAME.registerComponent('justrotate', {
  tick: function () {
    rotato(this.el);
  }
});

AFRAME.registerComponent('audio-react', {
  schema: {
    analyserEl: {type: 'selector'},
    property: {default: 'scale'},
    multiplier: {default: 1}, //
    build: {default: 0}, // Slowly build to full volume (num is speed)
    stablebase: {default: true}, // Stabilize bottom of scaling asset
    start: {default: 0},
  },
  init: function () {
    this.build = 0;
    this.firstpos = this.el.getAttribute('position');
    if (!this.data.build) {
      this.build = 1;
    }
    console.log("Will start dancing at " + this.data.start);
  },
  tick: function () {
    var data = this.data;
    var analyserEl = data.analyserEl;
    var volume = 0;
    var levels;
    
    var cam = document.querySelector('#camera');
    var campos = cam.getAttribute('position');
    //console.log("campos is " + campos + " and start is " + data.start);
    if (analyserEl && campos.z < (data.start + this.firstpos.z)) {
       volume = analyserEl.components.audioanalyser.volume * data.multiplier * 0.05;
    }
    else return;
    
    if (this.build < 1) {
      this.build += 0.001 * data.build;
    }
    var val = volume;
    var curprop = this.el.getAttribute(data.property);
    if (data.property == 'position') {
      if (data.reverse) {
        val = -val; 
      }
      this.el.setAttribute(data.property, {
        x: curprop.x,
        y: val,
        z: curprop.z
      });
    }
    else if (data.property == 'scale') {
      val = val / 2;
      this.el.setAttribute(data.property, {
        x: val,
        y: val,
        z: val
      });
      if (data.stablebase) {
        var curpos = this.el.getAttribute('position');
        this.el.setAttribute('position', {
          x: curpos.x,
          // TODO this may not work with moving objects, will always reset y position to initial
          y: this.firstpos.y + val/2,
          z: curpos.z
        });
      }
    }
  }
});


AFRAME.registerComponent('beat-emitter', {
  schema: {
    target: {default: ''}, 
  },
  init: function () {
    this.beatbar = beat;
    this.target = document.querySelector(this.data.target);
  },
  tick: function (time, timeDelta) {
    while (time > this.beatbar) {
      this.beatbar += beat * 2;
      if (time > 2000) {
        //console.log("beat emit!");
        this.target.emit('beat', 'deets', true);
      }
    }
  }
});

// Working emit listener from defunct component. Goes in init function
/*this.el.addEventListener('beat', function (event) {
  if (this.flip) {
    if (this.slid) {
      console.log("drop");
      this.children[0].emit('drop');
      this.slid = false;
    }
  }
  else {
    console.log("slide");
    this.children[0].children[0].emit('slide');
    this.slid = true;
  }
  this.flip = !this.flip;
});*/

// Math may seem arbitrary but there's a logic to it. Divides entity into 5 slices. 
// Basically, the goal is to keep the camera in the center slice. Ensures there are always 2/5th of the 
// total object both ahead and behind.
AFRAME.registerComponent('followcamera', {
  schema: {
    length: {default: 2},
    // Means origin point is away from camera (negative z)
    reverse: {default: false},
    stopfollow: {default: NaN},
    delete: {default: NaN},
  },
  init: function () {
    this.startpos = this.el.getAttribute('position');
    this.stopfollow = false;
    // Use for slow delete
    this.deleting = false;
  },
  tick: function () {
    var data = this.data;
    
    var cam = document.querySelector('#camera');
    if (!cam) { return; }
    
    var campos = cam.getAttribute('position');
    var position = this.el.getAttribute('position');
    var centerz = position.z - 3 * data.length / 5;
    if (data.reverse) {
      var centerz = position.z + 2* data.length / 5;
    }
    var pass = campos.z < centerz;
    //console.log("campos is " + campos.z + ", posz is " + position.z + ", centerz is " + centerz + ", reverse is " + this.data.reverse);
    if (pass && !this.stopfollow) {
      position.z -= data.length / 5;
      this.el.setAttribute('position', position);
    }
    if (campos.z < data.stopfollow) {
      this.stopfollow = true;
    }
    if (!isNaN(data.delete)) {
      if (campos.z < data.delete) {
        // Maybe factor into delete function?
        console.log(this.el.classList);
        if (this.el.classList.contains('slowdelete')) {
          // Add a more complex delete function here, probly just loop through the children and delete one per x tick
        }
        this.el.parentNode.removeChild(this.el); 
      }
    }
  }
});

var initialPos;

AFRAME.registerComponent('slide', {
  schema: {
    reset: {default: 8},
    axis: {default: 'z'},
    speed: {default: 5},
    loop: {default: true},
    stop: {default: 100000000},
  },
  init: function () {
    var el = this.el;
    var position = el.getAttribute('position');
    this.initialPos = position.z;
  },
  tick: function (time, timeDelta) {
    var el = this.el;
    // TODO: generalize for all axes and set reasonable default
    if (el.getAttribute('position').z < -1000) {
      return; 
    }
    var data= this.data;
    var positionTmp = this.positionTmp = this.positionTmp || {x: 0, y: 0, z: 0};
    var position = el.getAttribute('position');
    var xdelta = 0; var ydelta = 0; var zdelta = 0;
    switch (data.axis) {
      case 'x': {
        xdelta = data.speed * (timeDelta / 1000);
      }
      case 'y': {
        ydelta = data.speed * (timeDelta / 1000);
      }
      case 'z': {
        zdelta = data.speed * (timeDelta / 1000);
      }
    }
    //positionTmp.y = 30;
    positionTmp.x = position.x - xdelta;
    positionTmp.y = position.y + ydelta;
    positionTmp.z = position.z - zdelta;
    if (data.reset > 1 && positionTmp.z < this.initialPos - data.reset) {
      if (data.loop) {
        positionTmp.z = this.initialPos;
      }
      else {
        el.parentNode.removeChild(el); 
      }
    }
    el.setAttribute('position', positionTmp);
  }
});

AFRAME.registerComponent('timedisabler', {
  init: function () {
    this.time = 0;
    //console.log("test!");
  },
  tick: function () {
    this.time++;
    //console.log("time is " + this.time);
    if (this.time > 200) {
      var el = this.el;
      //el.parentNode.removeChild(el); 
      el.setAttribute('active', false);
    }
  }
});
//entity.setAttribute('animation__color', "property: material.color; dir: alternate; dur: 3000; easing: easeInSine; loop: true; to: rgb(0, 250, 0)");
//entity.setAttribute('animation__yoyo', "property: position; dir: alternate; dur: 1000; easing: easeInSine; loop: true; to: 0 " + i + " 0");
//entity.setAttribute('animation__scale', "property: scale; dir: alternate; dur: 200; easing: easeInSine; loop: true; to: 1.2 1 1.2");
