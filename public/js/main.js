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
