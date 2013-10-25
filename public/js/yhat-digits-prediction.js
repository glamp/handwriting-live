/*
yhat-digits-prediction - v0.0.1 - 2013-10-25
Guesses what digit your writing in real time.
Lovingly coded by yhat  - http://yhathq.com 
*/
/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'pencil';

  function init () {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');
    if (!canvaso) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
      alert('Error: I cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, 500, 500);

    // Get the tool select input.
    var tool_select = 'pencil';
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    // tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    makePrediction();
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
		contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;
    context.lineWidth = 10;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }

      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
      }
    };
  };

  init();

}, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

var canvas = document.getElementById('imageView'), 
    context = canvas.getContext('2d'), 
    n = Math.floor(Math.random() * 10);

// this times out if you don't ping it after a minute or so
var ws = new WebSocket("ws://starphleet-aa02a554-1981699582.us-west-1.elb.amazonaws.com/models/digitRecognizer/");

var lastPred = "";
// also calling this in example5.js:75
makePrediction = function() {
    var img = canvas.toDataURL().replace(/^data:image\/\w+;base64,/, "");
    if (img==lastPred) {
        // this could act as a "cache" if we wanted it to
    }
    lastPred = img;
    ws.send(JSON.stringify({image_string: img}));
};

var colorArray = [
    '#A6CEE3', 
    '#1F78B4', 
    '#B2DF8A', 
    '#33A02C', 
    '#FB9A99', 
    '#E31A1C', 
    '#FDBF6F', 
    '#FF7F00', 
    '#CAB2D6', 
    '#6A3D9A'
];

var offsets = [];

var app = {
    resizingTimeout: null,
    init: function(){
        this.max_size= 100;
        this.height = $('.scatter-plot').height();

        this.clearCanvas();
        this.createOffsets();
        this.update_points_test();
            
        $(".num").text(n);

        $("#clear").on('click', function(e){
            app.clearCanvas();
        });

        $(window).resize(function(){
            clearTimeout(app.resizingTimeout);
            app.resizingTimeout = setTimeout(app.createOffsets, 500);
        });
    },
    clearCanvas: function(){
        context.fillStyle = 'white';
        context.fillRect(0, 0, 500, 500);
    },
    createOffsets: function(){
        offsets = [];
        $('.number-line .point span').each(function(index){
            $('#prediction-'+index).css({left: ($(this).offset().left - $('.number-line').offset().left), background: colorArray[index]});
        });
    },
    update_points_test: function(){
        var probs = [0.01, 0.02, 0.03, 0.9, 0.1, 0.2, 0.07, 0.12, 0.67, 0.5];
        for(i=0; i<10; i++) {
            var size = probs[i]*app.max_size > 9 ? probs[i]*app.max_size : 10,
                top_align = probs[i]*app.height;
                $('#prediction-'+i).css({ 
                    bottom: top_align,
                    marginLeft: (-1)*(size/2),
                    marginTop: (size/2),
                    width: size, 
                    height: size
                });
        }
    }
};

/* 
   Right now this is just writing a <li> for each number. This could be something 
   way cooler like a chart or a graphic of some kind.
   */
ws.onmessage = function(evt) {
    var d = JSON.parse(evt.data);
    $(".counter").text(parseInt($(".counter").text()) + 1);
    for(i=0; i<10; i++) {
        var prob = d.probs["prob_" + i],
            size = prob*app.max_size > 9 ? prob*app.max_size : 10,
            top_align = prob*app.height;

        $('#prediction-'+i).css({ 
            bottom: top_align,
            marginLeft: (-1)*size,
            marginTop: size,
            width: size, 
            height: size            
        });
    }
};

$('document').ready(function(){
    app.init();
});
