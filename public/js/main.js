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
        this.clearCanvas();
        this.createOffsets();
        this.update_points_test();

        $(".num").text(n);

        $("#clear").on('click', function(e) {
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
        $('.point span').each(function(){
            offsets.push($(this).offset().left - $('.container').offset().left);
        });
    },
    update_points_test: function(){
        var probs = [1.345, 2.24356, 7, 3.4356, 9, 9.3245, 5.5, 4.321, 6.5431, 8.345];
        $(".prediction").remove();
        var numline_width = $('.point').width();
        for(i=0; i<10; i++) {
            var prob = probs[i],
                prob_low = Math.floor(prob),
                prob_percent = prob - prob_low,
                offset_left = offsets[prob_low] + (prob_percent*numline_width) - 20;

            $('.number-line').append('<div class="prediction" data-prob="'+prob+'" style="background:'+colorArray[i]+';left:'+offset_left+'px;margin-top:'+(i*5)+'px"></div>');
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
    $(".prediction").remove();
    var numline_width = $('.point').width();
    for(i=0; i<10; i++) {
        var prob = d.probs["prob_" + i],
            prob_low = Math.floor(prob),
            prob_percent = prob - prob_low,
            offset_left = offsets[prob_low]+(prob_percent*numline_width) -20;

        $('.number-line').append('<div class="prediction" data-prob="'+prob+'" style="background:'+colorArray[i]+';left:'+offset_left+'px;margin-top:'+(i*5)+'px"></div>');
    }
};

$('document').ready(function(){
    app.init();
});
