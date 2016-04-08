var Gamer = {}, Beasts = {}, timer;

function essence(param) {
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
    INCREMENTATION_STEP: 10,

    draw: function (args) {

        var data = {};

        // формируем аргументы
        if (typeof args != 'undefined') {

            if (typeof args.left != 'undefined') {
                this.left = this.left + args.left;
            }

            if (typeof args.top != 'undefined') {
                this.top = this.top + args.top;
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
        delete data;
    }
}

function beast() {}

beast.prototype =
{    
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

        delete this.life;

        var $obj = this,
            intervalId = setInterval(function () {
            
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
                        x1: $obj.top,
                        y1: $obj.left,
                        x2: $obj.top + $obj.height,
                        y2: $obj.left + $obj.width,
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
                        x1: Beasts[i].top,
                        y1: Beasts[i].left,
                        x2: Beasts[i].top + Beasts[i].height,
                        y2: Beasts[i].left + Beasts[i].width,
                    },
                    point = $obj.searchIntersection(figure1, figure2);

                // если звери пересекаються устраняем проблему
                if ( point[0].indexOf(1) > -1 ) {              

                    switch ( parseInt( point[0].toString().replace(/,/g, ''), 2 ) ) 
                    {
                        /**
                         * Правый верхний угол
                        */
                        case 1:
                            options.left -= figure1.x2 - figure2.x1;
                            options.top += figure1.y1 - figure2.y2;
                        break;
                        /**
                         * Правый нижний угол
                        */
                        case 2:
                            options.left -= figure1.x2 - figure2.x1;
                            options.top -= figure1.y1 - figure2.y1;
                        break;
                        /**
                         * Левый нижний угол
                        */
                        case 4:
                            options.left += figure2.x2 - figure1.x1;
                            options.top -= figure2.y1 - figure1.y2;
                        break;
                        /**
                         * Левый верхний угол
                        */
                        case 8:
                            options.left += figure2.x2 - figure1.x1;
                            options.top += figure2.y2 - figure1.y1;
                        break;
                    }

                    break;
                }
            }
            
            $obj.draw({
                top: options.top,
                left: options.left
            });

            delete point, figure1, figure2, options;

        }, 80);
    }
}

$(document).ready(function () {

    var counterBeast = $('#counter_beast');

    if (!localStorage['counterBeast'])
    {
        localStorage['counterBeast'] = counterBeast.val();
    } 
    else 
    {
        counterBeast.val(localStorage['counterBeast']);
    }

    counterBeast.on('keyup', function() {
        var $this = $(this);
        if ($this.val() > 7)
        { 
            $this.val(7);
        } else if ($this.val() < 3)
        { 
            $this.val(3);
        }
    });

    var gameStart = function()
    {

        if (!Gamer.life)
        {
            location.reload();
            localStorage['gameStart'] = 1;
        }

        localStorage['counterBeast'] = counterBeast.val();
        
        if (timer)
            return;

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
    	
    	for (var i = 1; i <= localStorage['counterBeast']; i++) {

    		var clone = $('.essence').clone().css({'text-align': 'center', 'color': 'white', 'line-height': '50px'})
                            .html('<span>' + i + '</span>'),
    		    color = 'rgb(' + Math.floor(Math.random() * 1000 / 4)
    		        + ', ' + Math.floor(Math.random() * 1000 / 4)
    		        + ', ' + Math.floor(Math.random() * 1000 / 4) + ')',
    		    Beast = 'Beast' + i;

    		$("#ramka").append(clone);

    		Beasts[Beast] = new essence({
    		    color: color,
    		    $obj: clone
    		});
            $.extend(Beasts[Beast], new beast());
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

    if (!localStorage['gamerColor']) 
    {
        localStorage['gamerColor'] = "#f00";
    }

    $("#custom").spectrum({
        color: localStorage['gamerColor']
    });

    Gamer = new essence({
        $obj: $('#ramka div.ball'),
        color: localStorage['gamerColor']
    });

    Gamer.draw({color: Gamer.color});

    $('form input[name=draw]').on('click', function () {
        $('#ramka div.ball').show();
        localStorage['gamerColor'] = $('.sp-preview-inner').css('background-color');
        Gamer.draw({color: localStorage['gamerColor']});
    });

    var cases = {
        top: $('#case_top'),
        left: $('#case_left'),
        right: $('#case_right'),
        bottom: $('#case_bottom')
    };

    $(document).on('keypress', function (event) {

        Gamer.color = localStorage['gamerColor'];

        switch (event.keyCode) {
            // хром, опера, сафари
            case 56:
            // firefox
            case 38:
                cases.top.animate({opacity: 0.5},10).animate({opacity: 1}, 10);
                Gamer.top -= Gamer.INCREMENTATION_STEP;
                Gamer.draw();
                break;
            // хром, опера, сафари    
            case 54:
            // firefox
            case 39:
                cases.right.animate({opacity: 0.5},10).animate({opacity: 1}, 10);
                Gamer.left += Gamer.INCREMENTATION_STEP;
                Gamer.draw();
                break;
            // хром, опера, сафари     
            case 50:
            // firefox
            case 40:
                cases.bottom.animate({opacity: 0.5},10).animate({opacity: 1}, 10);
                Gamer.top += Gamer.INCREMENTATION_STEP;
                Gamer.draw();
                break;
            // хром, опера, сафари         
            case 52:
            // firefox
            case 37:
                cases.left.animate({opacity: 0.5},10).animate({opacity: 1}, 10);
                Gamer.left -= Gamer.INCREMENTATION_STEP;
                Gamer.draw();
                break;
             // хром, опера, сафари            
    	     case 115:
             case 83:
             case 1099:
             case 1067:
             // firefox
             case 0:
    		    gameStart();
		     break;
        }
    });

    $('form input[name=start]').on('click', function () {
        gameStart();
    });

    if (localStorage['gameStart'])
    {
        gameStart();
        delete localStorage['gameStart'];
    }
});
