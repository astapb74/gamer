/**
 * Created by mpeegy on 13.06.14.
 */

var Gamer = {}, Beasts = {}, timer;

function essence(param) {
    this.radiusCollision = param.radiusCollision;
    this.color = param.color;
    this.obj = param.$obj;
    this.left = typeof param.left != 'undefined' ? param.left : 0;
    this.top = typeof param.top != 'undefined' ? param.top : 0;
    this.width = 50;
    this.height = 50;
    this.life = true;
}

essence.prototype =
{
    constructor: essence,
    INCREMENTATION_STEP: 5,

    draw: function (args) {

        var data = {};

        // формируем аргументы
        if (typeof args != 'undefined') {

            if (typeof args.left != 'undefined') {
                this.left = this.left + args.left;

            }

            if (typeof args.top != 'undefined') {
                this.top = this.top + args.top;
                //<= 0 ? 0 : this.top + args.top;

            }

            if (typeof args.color != 'undefined') {
                this.color = args.color;
            }

            if (typeof args.zIndex != 'undefined') {
                $.extend(data, {zIndex: args.zIndex})
            }
        }

        // описываем движение
        if (this.left < 0) {
            this.left = 0;
        } else if (this.left > 900 - this.width) {
            this.left = 900 - this.width;
        }

        if (this.top < 0) {
            this.top = 0;
        } else if (this.top > 400 - this.height) {
            this.top = 400 - this.height;
        }

        $.extend(data, {
            backgroundColor: this.color,
            marginLeft: this.left,
            marginTop: this.top
        })

        this.obj.css(data);
    },
    
    searchIntersection: function(figure1, figure2) {
        
        var // ищем пересечение координат
            point = [
                // левый верхний угол сравниваем с
                [
                // левым верхним углом
                    figure1.x1 >= figure2.x1 && figure1.y1 >= figure2.y1,
                // левым нижним углом
                    figure1.x1 <= figure2.x2 && figure1.y1 >= figure2.y1,
                // правым нижнем углом
                    figure1.x1 <= figure2.x2 && figure1.y1 <= figure2.y2,
                // правым верхним углом
                    figure1.x1 >= figure2.x1 && figure1.y1 <= figure2.y2
                ],
                // левый нижний угол сравниваем с
                [
                // правым нижним углом
                    figure1.x2 <= figure2.x1 && figure1.y1 <= figure2.y2,
                // правым нижнем углом
                    figure1.x2 <= figure2.x2 && figure1.y1 <= figure2.y2,
                // левым нижнем углом
                    figure1.x2 <= figure2.x2 && figure1.y1 <= figure2.y1,
                // левый верхний угол
                    figure1.x2 >= figure2.x1 && figure1.y1 >= figure2.y1
                ],
                // правый нижний угол
                [
                // левый верхний угол
                    figure1.x2 >= figure2.x1 && figure1.y2 >= figure2.y1,
                // правый верхний угол
                    figure1.x2 >= figure2.x1 && figure1.y2 <= figure2.y2,
                // правый нижний угол
                    figure1.x2 <= figure2.x2 && figure1.y2 <= figure2.y2,
                // левый нижний угол
                    figure1.x2 <= figure2.x2 && figure1.y2 >= figure2.y1
                ],
                // правый верхний угол
                [
                // правый верхний угол 
                    figure1.x1 >= figure2.x1 && figure1.y2 <= figure2.y2,
                // левый верхний угол
                    figure1.x1 >= figure2.x1 && figure1.y2 >= figure2.y1,
                // левый нижний угол
                    figure1.x1 <= figure2.x2 && figure1.y2 >= figure2.y1,
                // правый нижний угол
                    figure1.x1 <= figure2.x2 && figure1.y2 <= figure2.y2
                ]
            ];
            
            // проверяем где мы пересеклись
            for( var j in point ) {

                point[0][j] = (point[j].indexOf(false) === -1 ? 1 : 0);

                // ненужные данные в мусор
                if( j > 0 ) {
                    delete point[j];
                }
            }
            
            return point;
        
    },

    // автоматическое инициализация объекта
    // позволяет объекту обнаружить жертву
    inc: function () {

        var $obj = this;


        var intervalId = setInterval(function () {
            
            // Если жертвы нет, то мне делать нечего
            if( !Gamer.life ) {
                clearInterval(intervalId);
                clearInterval(timer);
            }

            var options = {
                    top:  Gamer.top > $obj.top ? 5 : -5,
                    left: Gamer.left > $obj.left ? 5 : -5
                },
                // Я смотрю на 
                figure1 = {
                        x1: $obj.top - $obj.radiusCollision,
                        y1: $obj.left - $obj.radiusCollision,
                        x2: $obj.top + $obj.height + $obj.radiusCollision,
                        y2: $obj.left + $obj.width + $obj.radiusCollision,
                    },
               // Сьел ли я жертву
               figure2 = {
                        x1: Gamer.top,
                        y1: Gamer.left,
                        x2: Gamer.top + Gamer.height,
                        y2: Gamer.left + Gamer.width,
               },
               point = $obj.searchIntersection(figure1, figure2);
                      
                  
           // меня сьели     
           if( point[0].indexOf(1) > -1 ) {
                Gamer.obj.remove();
                Gamer.life = false;
                clearInterval(intervalId);
                clearInterval(timer);
           } 

            // Зверь просматривает своих друзей
            for ( var i in Beasts ) {

                // мне сейчас не до себя

                if( Beasts[i].name.indexOf( $obj.name ) > -1 ) {
                    continue;
                }

                // на товарища                
                var figure2 = {
                        x1: Beasts[i].top - Beasts[i].radiusCollision,
                        y1: Beasts[i].left - Beasts[i].radiusCollision,
                        x2: (Beasts[i].top - Beasts[i].radiusCollision) + Beasts[i].height + Beasts[i].radiusCollision,
                        y2: (Beasts[i].left - Beasts[i].radiusCollision) + Beasts[i].width + Beasts[i].radiusCollision,
                    },
                    point = $obj.searchIntersection(figure1, figure2);

                // если звери пересекаються устраняем проблему

                if ( point[0].indexOf(1) > -1 ) {
                    
                    var top   = figure2.x2 - figure1.x1,
                        leftL = figure2.y2 - figure1.y1,
                        leftR = figure1.y2 - figure2.y2;                     
                    
                    point = parseInt( point[0].toString().replace(/,/g, ''), 2 );
                    console.log(point);
                    // если пересечение справа или слева идем обратно
                    options.left = point > 4 ? figure2.x2 - figure1.x1 : 0;
                    // если пересечение сверху идем вниз
                    options.top = point > 1 && point < 8 ? leftR : -leftL;
                 
                    break;
                }
            }

            $obj.draw({
                top: options.top,
                left: options.left
            });

        }, 100);


    }
}

$(document).ready(function () {

    var gameStart = function()
    {

        timer = setInterval(function(){ 
            var time = $('#timer').text().split(':');

                time[1] = parseInt(time[1]) + 1;
                if (time[1] == 60)
                { 
                    time[1] = '00';
                    time[0] = parseInt(time[0]) + 1;
                    time[0] = time[0] < 10 ? '0' + time[0] : time[0];
                } 
                else if (time[1] < 10)
                { 
                    time[1] = '0' + time[1];
                }

                $('#timer').text(time.join(':'));
        }, 1000);

    	var counterBeast = parseInt($('#counter_beast').val());
    	
    	for (var i = 1; i <= counterBeast; i++) {

    		var clone = $('.essence').clone().css({'text-align': 'center', 'color': 'white', 'line-height': '50px'}).html('<span>' + i + '</span>'),
    		    color = 'rgb(' + Math.floor(Math.random() * 1000 / 4)
    		        + ', ' + Math.floor(Math.random() * 1000 / 4)
    		        + ', ' + Math.floor(Math.random() * 1000 / 4) + ')',
    		    Beast = 'Beast' + i;


    		$("#ramka").append(clone);


    		Beasts[Beast] = new essence({
    		    color: color,
    		    $obj: clone,
    		    radiusCollision: 10
    		});

    		Beasts[Beast].name = Beast;
    		

    		Beasts[Beast].draw({

    		    left: Math.floor(Math.random() * 1000),
    		    top: Math.floor(Math.random() * 1000 / 2),
                position: 'relative',
    		    zIndex: 3
    		});

    		Beasts[Beast].inc();

    	}
    }

    $('#counter_beast').on('change', function() { 
        var $this = $(this);
        if ($this.val() > 5)
        { 
            $this.val(5);
        }
        if ($this.val() < 1)
        { 
            $this.val(1);
        }
    });

    $("#custom").spectrum({
        color: "#f00"
    });

    Gamer = new essence({
        $obj: $('#ramka div.ball'),
        radiusCollision: 10,
        color: 'blue'
    });

    $('form input[name=draw]').on('click', function () {
        $('#ramka div.ball').show();
        Gamer.draw({color: $('.sp-preview-inner').css('background-color')});
    });

    $(document).on('keypress', function (event) {

        Gamer.color = $('.sp-preview-inner').css('background-color');

        switch (event.keyCode) {
            case 56:
                Gamer.top -= 5;
                Gamer.draw();
                break;
            case 54:
                Gamer.left += 5;
                Gamer.draw();
                break;
            case 50:
                Gamer.top += 5;
                Gamer.draw();
                break;
            case 52:
                Gamer.left -= 5;
                Gamer.draw();
                break;
    	     case 115:
    		    gameStart();
		        break;
        }
    });

    $('form input[name=start]').on('click', function () {

        gameStart();

    });


});
