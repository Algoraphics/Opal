/* global AFRAME, getRandomColor, hexToRgb, bind */

/* RNG (Random Number Generator)
This file contains RNG components used mostly by worldbuilders.

The expected behavior of an rng component is to take in only the width and height
of the asset as a static parameter. Other variables are entered in the form of a
string of relative probabilities. The value of those variables will be chosen at
random using said probabilities, from a list of options set inside the rng component.
*/

// Global vars used by assets to time animations to music
var beat = 594.059;
var dur = beat * 4;
var animAttrs = ' dir: alternate; loop: true; ';

/*
  Main rng function. This thing is a workhorse for procedural generation.
  options come in the form [a, b, c, d]
  probstr in the form '1 2 3 0'
  The idea here is that it is now trivial to say "I want option A to appear
  twice as often as option B. Ex: rng([A, B],"2 1");
*/
function rng(options, probstr) {
  var choose_array = chooseArr(options, probstr);
  return pick_one(choose_array);
}

/*
  Function simply picks a value from an input array of choices.
*/
function pick_one(choose_array) {
  return choose_array[Math.floor(Math.random() * choose_array.length)];
}

/*
  Builds choose array from which rng options are chosen.
  Ex: for [a, b, c, d] and '1 2 3 0' choose_array looks like [a, b, b, c, c, c]
*/
function chooseArr(options, probstr) {
  var probs = probArr(options, probstr);
  var choose_array = [];
  var outdex;
  for (var i = 0; i < options.length; i++) {
    outdex = probs[i];
    while (outdex > 0) {
      choose_array.push(options[i]);
      outdex--;
    }
  }
  return choose_array;
}

// Parse probability array from string "1 2 3" -> [1, 2, 3]
function probArr(options, probstr) {
  //console.log("Checking probs for options "  + options + " and probstr " + probstr);
  var probs = probstr.split(' ');
  if (options.length != probs.length) {
    console.error("Options array length " + options.length + " must match probabilities array length " + probs.length);
    return NaN;
  }
  return probs;
}

/*
  Add listeners to an asset so it can begin movement once it hears a beat.
  Takes in "startclass" which is the class of child assets which should also be
  activated along with the parent.
*/
function addBeatListener(comp, startclass) {
  comp.el.addEventListener('beat', function (event) {
    if (!this.started) {
      // Tell parent asset it should start moving
      this.started = true;

      // If we have the class name of children, tell them all to start
      if (startclass != '') {
        var els = this.querySelectorAll('.' + startclass);
        for (var i = 0; i < els.length; i++) {
          els[i].emit('started');
        }
      }
      
      this.emit('started');
    }
  });
}

/* 
  Generate buildings which do not use shaders. These are made using
  individual plane geometries for windows. They use more GPU resources,
  but they are affected by environment fog and allow for a different set
  of animations than buildings made with custom shaders.
*/
AFRAME.registerComponent('rng-building', {
  schema: {
    // Input probabilities
    windowtype: {default: '1 1 1 1 1'},
    colortype: {default: '1 0 0 0 0 0'},
    color1: {default: ''},
    color2: {default: ''},
    width: {default: 1},
    height: {default: 1},
  },
  init: function () {
    var data = this.data;
    
    var height = data.height;
    var width = data.width;
    var window = rng(['rect', 'circle', 'triangle', 'diamond', 'bars'], data.windowtype);
    var colortype = rng(['static', 'shimmer', 'rainbow', 'rainbow_shimmer', 'flip', 'flip_audio'], data.colortype);
    
    //console.log("width is " + width + ", height is " + height + ", windowtype is " + window);
    
    var building = document.createElement('a-entity');
    building.setAttribute('building', "windowtype: " + window + "; colortype: " + colortype + "; color1: "
                          + data.color1 + "; color2: " + data.color2 + "; width: " + width + "; height: " + height);
    this.el.appendChild(building);
    this.id++;
  }
});

/*
  Generate buildings using building-shader. Uses almost all of the ridiculous number
  of features provided by the shader.
  Also supports a "grow" animation where the building grows out of a 2D plane. The
  animation can be triggered by a beat from the music manager.
*/
AFRAME.registerComponent('rng-building-shader', {
  schema: {
    axis: {default: '1 1'},
    width: {default: 1},
    height: {default: 1},
    static: {default: '1 1'},
    grows: {default: '1 1 1 1'},
    grow_slide: {default: '1 1'},
    color1: {default: ''},
    color2: {default: ''},
    usecolor: {default: '1 1'},
    colorstyle: {default: '1 1 1 1'}, // single color, two color, one color to gradient, gradient
    coloroffset: {default: 0},
    winheight: {default: '1 2 8 1'},
    winwidth: {default: '2 8 4'},
    triggerbeat: {default: -1},
    action: {default: ''},
    speed: {default: 1.0},
    timeskip: {default: 0},
    side: {default: 'single'},
  },
  init: function () {
    var data = this.data;
    
    var height = data.height;
    var width = data.width;
    // Window height and width can be specified externally or randomly chosen
    var winheight = parseFloat(data.winheight);
    if (data.winheight.split(' ').length == 4) {
      winheight = rng([0.2, 0.5, 0.65, 0.95], data.winheight);
    }
    var winwidth = parseFloat(data.winwidth);
    if (data.winwidth.split(' ').length == 3) {
      winwidth = rng([0.4, 0.5, 1.1], data.winwidth);
    }
    var buildingwidth = 5 * width;
    var buildingheight = 6.5 * height;
    var midheight = buildingheight / 2;
    
    var numrows = 2 * height;
    var numcols = 2 * width;
    var colorgrid = 0.0;
    var invertcolors = 0.0;
    
    var speed = data.speed;
    var slide = 0.0;
    var slidereverse = 0.0;
    var grow = 0.0;
    var move = rng([0.0, 1.0], data.static);
    var axis = rng([0.0, 1.0], data.axis);
    if (move) {
      var ngs = rng([0.0, 1.0], data.grow_slide);
      slidereverse = Math.floor(Math.random() * 2);
      slide = ngs;
      grow = 1 - ngs;
    }
    var growsine = 0.0;
    var growclamp = 0.0;
    var growvert = 0.0;
    // Color can be specified externally or randomly chosen
    var color1 = data.color1;
    if (data.color1 == '') {
      color1 = getRandomColor();
    }
    var color2 = data.color2
    if (data.color2 == '') {
      color2 = getRandomColor();
    }
    
    var usecolor1 = 1.0;
    var usecolor2 = 1.0;
    var colorstyle = data.colorstyle;
    if (data.colorstyle.split(' ').length == 4) {
      colorstyle = rng(['single', 'double', 'singlegrad', 'doublegrad'], data.colorstyle);
    }
    if (colorstyle == 'single') {
      color2 = color1;
    }
    else if (colorstyle == 'singlegrad') {
      usecolor1 = rng([1.0, 0.0], data.usecolor);
      usecolor2 = 1.0 - usecolor1;
      colorgrid = rng([1.0, 0.0], data.usecolor);
    }
    else if (colorstyle == 'doublegrad') {
      usecolor1 = 0.0;
      usecolor2 = 0.0;
      colorgrid = rng([1.0, 0.0], data.usecolor);
    }
    var coloroffset = data.coloroffset;
    var timeskip = data.timeskip;
    
    var building = document.createElement('a-entity');
    
    // Special case changes for physical grow animation
    if (data.action == 'grow') {
        this.el.setAttribute("visible", false);
        building.setAttribute('scale', "1 0.001 1");
        
        grow = numrows;
        growvert = 1.0;
        growclamp = 1.0;
        speed = 1.27*speed;
        numrows = 0.1;
        midheight = 0;
    }
    else if (grow) {
      colorgrid = 1.0;
      var mult = rng([1.0, 50.0, 150.0, 200.0], data.grows);
      numrows = mult * numrows;
      numcols = mult * numcols;
      if (mult > 100) {
        invertcolors += 1;
        winheight = 0.95;
        winwidth = 0.95;
      }
      else {
        grow *= 16;
      }
    }
    
    // Spaceship blocks have no top, and are centered
    if (data.action != 'spaceship') {
      // Cover top of building so we don't see windows
      var top = document.createElement('a-entity');
      top.setAttribute('geometry', "primitive: plane; width: " + buildingwidth + "; height: " + buildingwidth);
      top.setAttribute('material', "shader: flat; color: #000000");
      top.setAttribute('position', "0 " + (buildingheight + 0.02) + " 0");
      top.setAttribute('rotation', "-90 0 0");
      this.el.appendChild(top);
    }
    else {
      midheight = 0;
    }
    
    building.setAttribute('material', "side: " + data.side + "; shader: building-shader; timeskip: " + timeskip
                          + "; color1: " + color1 + "; color2: " + color2 + "; numrows: " + numrows + "; numcols: " + numcols
                          + "; grow: " + grow + "; growsine: " + growsine + "; growvert: " + growvert + "; growclamp: " + growclamp + "; growstart: " + 0.0 + "; invertcolors: " + invertcolors
                          + "; slide: " + slide + "; slidereverse: " + slidereverse + "; slideaxis: " + axis
                          + "; colorslide: " + slide + "; coloraxis: " + axis + "; colorgrid: " + colorgrid
                          + "; speed: " + speed + "; height: " + winheight + "; width: " + winwidth
                          + "; coloroffset: " + data.coloroffset + "; usecolor1: " + usecolor1 + "; usecolor2: " + usecolor2);
    building.setAttribute('geometry', "primitive: box; width: " + buildingwidth + "; height: " + buildingheight + "; depth: " + buildingwidth);
    building.setAttribute('position', "0 " + midheight + " 0");
    this.el.appendChild(building);
    
    // Vars that need to be passed to a listener
    this.el.midheight = buildingheight/2;
    this.el.width = width;
    
    if (data.triggerbeat >= 0) {
      this.el.setAttribute('class', 'beatlistener' + data.triggerbeat);
      if (data.action == 'grow') {
        this.el.addEventListener('beat', function () {
          // Animate building geometry to grow from a 2D plane at the base
          this.children[1].setAttribute("animation__grow", "property: scale; from: 1 0.001 1; to: 1 1 1; dur: " + (beat*height/data.speed) + "; easing: linear");
          this.children[1].setAttribute("animation__move", "property: position; from: 0 0 0; to: 0 " + this.midheight + " 0; dur: " + (beat*height/data.speed) + "; easing: linear");
          // Animate topper too
          this.children[0].setAttribute("animation__move", "property: position; from: 0 0.5 0; to: 0 " + (this.midheight*2 + this.width*0.02) + " 0; dur: " + (beat*height/data.speed) + "; easing: linear");
          // Move shader time back to origin to reset window animation
          var time = this.children[1].getObject3D('mesh').material.uniforms['timeMsec']['value'];
          this.children[1].getObject3D('mesh').material.uniforms['timeskip']['value'] -= -time;
          this.setAttribute("visible", true);
        });
      }
      else if (data.action == 'lights') {
        this.el.addEventListener('beat', function () {
          var time = this.children[1].getObject3D('mesh').material.uniforms['timeMsec']['value'];
          this.children[1].getObject3D('mesh').material.uniforms['timeskip']['value'] -= -time - (2.2*594.094);
          var color = this.children[1].getObject3D('mesh').material.uniforms['color2']['value'];
          var nextcolor = hexToRgb(getRandomColor());
          color.x = nextcolor.r / 255;
          color.y = nextcolor.g / 255;
          color.z = nextcolor.b / 255;
          this.children[1].getObject3D('mesh').material.uniforms['color2']['value'] = color;
        });
      }
      else if (data.action == 'portal') {
        this.el.addEventListener('beat', function () {
          if (this.activated) {
            var time = this.children[1].getObject3D('mesh').material.uniforms['timeMsec']['value'];
            this.children[1].getObject3D('mesh').material.uniforms['timeskip']['value'] -= -time;
            this.children[1].getObject3D('mesh').material.uniforms['speed']['value'] = 10.0;
          }
          else {
            this.setAttribute('class', 'beatlistener' + (data.triggerbeat + 8));
            this.setAttribute('animation__scale', "property: scale; from: 0.01 0.01 0.01; to: 1 1 1; easing: easeInOutQuart; dur: 2376.236;");
            this.activated = true;
          }
        });
      }
    }
  }
});

/*
  Rng component for customizeable objects with complex shaders.
*/
AFRAME.registerComponent('rng-shader', {
  schema: {
    
    shader: {default: ''},
    shape: {default: '1 1 1'},
    
    speed: {default: '1 1 1'},
    brightness: {default: '1 1 1'},
    resolution: {default: '1 1 1 1'},
    fadeaway: {default: 1.0},
    uniformity: {default: 1.0},
    zoom: {default: 1.0},
    intensity: {default: 1.0},
    skip: {default: 2.0},
    
    color: {default: ''},
    bgcolor: {default: ''}, 
    
    height: {default: 1},
    width: {default: 1},
  },
  init: function () {
    var data = this.data;
    
    this.mouse = 0;
    this.shift = 0.0;
    
    this.speed = rng([0.5, 1.0, 2.0], data.speed);
    this.brightness = rng([1.0, 2.0, 3.0], data.brightness);
    this.resolution = rng([0.5, 1.0, 2.0, 3.0], data.resolution);
    // Lightspeed uses these
    var fadeaway = 0.5;
    var uniformity = 10.0;
    // Kaleidoscope (kal) uses this
    var zoom = 100.0;
    // Grid uses this for brightness level
    var intensity = 10.0;
    // Fractal uses this to skip further in time and see new patterns
    var skip = data.skip;
    
    var color = data.color;
    if (!color) {
      color = getRandomColor();
    }
    var bgcolor = data.backgroundColor;
    if (!bgcolor) {
      bgcolor = getRandomColor();
    }
    
    var shader = data.shader;
    var shape = rng(['box', 'sphere', 'cylinder'], data.shape);
    var entity = document.createElement('a-entity');
    entity.setAttribute('geometry', "primitive: " + shape + "; height: " + data.height + "; width: " + data.width 
                         + "; depth: " + data.width + "; radius: " + (data.width / 2) + "segmentsWidth: 80; segmentsHeight: 80;");
    entity.setAttribute('material', "side: double; shader: " + shader + "-shader; speed: " + this.speed
                    + "; brightness: " + this.brightness + "; color: " + color + "; backgroundColor: " + bgcolor 
                    + "; resolution: " + this.resolution + "; fadeaway: " + fadeaway + "; uniformity: " + uniformity
                    + "; zoom: " + zoom + "; intensity: " + intensity + "; skip: " + skip
                    + "; frequency: " + 15 + "; amplitude: " + 0.2 + "; displacement: " + 0.5 + "; scale: " + 4.0);
    this.el.appendChild(entity);
  },
});

AFRAME.registerComponent('rng-disco-tunnel', {
  schema: {
    radius: {default: 10},
    length: {default: 87},
    floaters: {default: true},
  },
  init: function () {
    var data = this.data;
    
    var numFloaters = 0;
    if (data.floaters) {
      numFloaters = Math.floor(Math.random() * 4) + 5;
    }
    console.log("Numfloaters is " + numFloaters);
    
    for (var i = 0; i < numFloaters + 1; i++) {
      var radius = data.radius*2;
      var postr = "0 0 0";
      var rotation = "";
      var resolution = 2.0;
      var speed = 1.0;
      var shape = 'sphere';
      // Floaters have different values
      if (i > 1) {
        shape = 'sphere';
        radius = (data.radius / 20) * ((Math.random() * 2) + 2);
        var posx = ((Math.random() * (data.radius - 1)) + 1) * pick_one([-1, 1])
        var posy = ((Math.random() * (data.radius - 1)) + 1) * pick_one([-1, 1])
        var posz = Math.random() * data.length * 0.4 * pick_one([-1, 1])
        postr = posx + " " + posy + " " + posz;
        rotation = "property: rotation; from: 0 0 0; to: 0 360 0; loop: true; easing: linear; dur: 20000";
        resolution = rng([0.25, 0.5, 1.0], "2 2 2");
        speed = pick_one([1.0, 2.0]);
      }
      var color = pick_one(['red','orange', 'yellow', 'pink', 'cyan']);
      var bgcolor = pick_one(['green','blue', 'purple', 'black']);
      
      
      var ball = document.createElement('a-entity');
      ball.setAttribute('geometry', "primitive: " + shape + "; radius: " + radius + "; height: " + data.length);
      ball.setAttribute('material', "side: double; shader: disco-shader; speed: " + speed + "; resolution: " + resolution
                       + "; color: " + color + "; backgroundColor: " + bgcolor);
      ball.setAttribute('position', postr);
      ball.setAttribute('animation__rotate', rotation);
      ball.setAttribute('rotation', "90 0 0");
      this.el.appendChild(ball);
    }
  },
});

/*
  Fractal specific shader component with keyboard control support.
  
  This is not a generic component. Mostly because the keyboard controls need a direct path
  to the object3D, which is non-trivial to make generic.
*/
AFRAME.registerComponent('rng-fractal-shader', {
  schema: {
    speed: {default: '1 1 1'},
    brightness: {default: '1 1 1'},
    resolution: {default: '1 1 1 1'},
    fadeaway: {default: 1.0},
    uniformity: {default: 1.0},
    zoom: {default: 1.0},
    intensity: {default: 1.0},
    skip: {default: 2.0},
    
    color: {default: ''},
    bgcolor: {default: ''}, 
    
    height: {default: 1},
    width: {default: 1},
  },
  init: function () {
    var data = this.data;
    
    this.mouse = 0;
    this.shift = 0.0;
    
    this.speed = rng([0.5, 1.0, 2.0], data.speed);
    this.resolution = rng([0.5, 1.0, 2.0, 3.0], data.resolution);
    
    // Skip further in time and see new patterns
    var skip = data.skip;
    
    var entity = document.createElement('a-entity');
    entity.setAttribute('geometry', "primitive: sphere; height: 5; width: 5; depth: 0; radius: " + (data.width / 2) + "segmentsWidth: 80; segmentsHeight: 80;");
    entity.setAttribute('material', "side: double; shader: simple-fractal-shader; speed: " + this.speed
                    + "; resolution: " + this.resolution + "; skip: " + skip + "; amplitude: " + 0.2
                    + "; displacement: " + 0.5 + "; scale: " + 4.0 + "; vertexnoise: " + 0.1
                    + "; shatter: " + 1.0 + "; twist: " + 1.0 + "; speed: " + 1.0);
    this.el.appendChild(entity);
    
    this.el.sceneEl.canvas.addEventListener('mousedown', this.onMouseDown, false);
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener("keydown", function(e){
      if(e.keyCode === 81) { // q key to shift back
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['skip']['value'] -= 0.005;
      }
      if(e.keyCode === 69) { // e key to shift forward
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['skip']['value'] += 0.005;
      }
      if(e.keyCode === 90) { // z key to zoom in
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['resolution']['value'] -= 0.1;
      }
      if(e.keyCode === 88) { // x key to zoom out
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['resolution']['value'] += 0.1;
      }
      if(e.keyCode === 67) { // c key to shatter
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['shatter']['value'] -= 0.005;
      }
      if(e.keyCode === 86) { // v key to reverse shatter
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['shatter']['value'] += 0.005;
      }
      if(e.keyCode === 66) { // b key to reset shatter and twist
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['shatter']['value'] = 1.0;
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['twist']['value'] = 1.0;
      }
      if(e.keyCode === 78) { // n key to twist
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['twist']['value'] += 0.01;
      }
      if(e.keyCode === 77) { // m key to untwist
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['twist']['value'] -= 0.01;
      }
      if(e.keyCode === 82) { // r key to ripple
        var ripple = document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['vertexnoise']['value'];
        if (ripple < 2) { // Ripple can literally eat the menu if left unchecked
          document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['vertexnoise']['value'] += 0.1;
        }
      }
      if(e.keyCode === 84) { // t key to reset ripple
        document.querySelector('#fractal').children[0].getObject3D('mesh').material.uniforms['vertexnoise']['value'] = 0.0;
      }
    })
  },
  tick: function (event) {
    if (this.shift != 0) {
      //console.log("shifting by " + this.shift);
      this.el.children[0].getObject3D('mesh').material.uniforms['val']['value'] += this.shift;
    }
  },
});

