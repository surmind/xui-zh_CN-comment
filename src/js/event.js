/**
	Event
	=====

    以全新的方式处理事件

	- click
	- load
	- touchstart
	- touchmove
	- touchend
	- touchcancel
	- gesturestart
	- gesturechange
	- gestureend
	- orientationchange
	
*/
xui.events = {}; var cache = {};
xui.extend({

/**
	on
	--

    给元素集的DOM事件注册一个回调函数。

	### 语法 ###

		x$( 'button' ).on( type, fn );

	或

		x$( 'button' ).click( fn );

	### 参数 ###

	- type `字符串` 要注册的事件类型 (如： _load_, _click_, _touchstart_ 等)。
	- fn `函数` 事件触发时要执行的回调函数。

	### 例子 ###

		x$( 'button' ).on( 'click', function(e) {
		    alert('hey that tickles!');
		});

	或

		x$(window).load(function(e) {
		  x$('.save').touchstart( function(evt) { alert('tee hee!'); }).css(background:'grey');
		});
*/
    on: function(type, fn, details) {
        return this.each(function (el) {
            if (xui.events[type]) {
                var id = _getEventID(el), 
                    responders = _getRespondersForEvent(id, type);
                
                details = details || {};
                details.handler = function (event, data) {
                    xui.fn.fire.call(xui(this), type, data);
                };
                
                // trigger the initialiser - only happens the first time around
                // 触发初始化 - 只有第一次
                if (!responders.length) {
                    xui.events[type].call(el, details);
                }
            } 
            el.addEventListener(type, _createResponder(el, type, fn), false);
        });
    },

/**
	un
	--

    注销一个特定的回调函数，如果没有指定回调函数，
    注销注册在一个特定事件类型上的所有回调函数。

	### 语法 ###

    注销绑定在所有button元素的type类型事件上的fn函数

		x$( 'button' ).un( type, fn );

    注销所有绑定在button元素的type类型事件上的回调函数：

		x$( 'button' ).un( type );

	### 参数 ###

	- type `字符串` 要注销的事件类型 (如： _load_, _click_, _touchstart_等)。
	- fn `函数` 要注销的回调函数 _(可选)_.

	### 例子 ###

        // 首先，创建一个点击事件，用来显示一个alert信息
		x$('button').on('click', function() {
		    alert('hi!');
		});
		
        // 现在演示的是注销所有响应button元素click事件的函数
		x$('button').un('click');

	或

		var greeting = function() { alert('yo!'); };
		
		x$('button').on('click', greeting);
		x$('button').on('click', function() {
		    alert('hi!');
		});
		
		// 任何button元素被点击时，信息'hi!'会被触发，而'yo!'不会。
		x$('button').un('click', greeting);
*/
    un: function(type, fn) {
        return this.each(function (el) {
            var id = _getEventID(el), responders = _getRespondersForEvent(id, type), i = responders.length;

            while (i--) {
                if (fn === undefined || fn.guid === responders[i].guid) {
                    el.removeEventListener(type, responders[i], false);
                    removex(cache[id][type], i, 1);
                }
            }

            if (cache[id][type].length === 0) delete cache[id][type];
            for (var t in cache[id]) {
                return;
            }
            delete cache[id];
        });
    },

/**
	fire
	----

    对xui集中的元素触发一个特定的事件

	### 语法 ###

		x$( selector ).fire( type, data );

	### 参数 ###

	- type `字符串` 要触发的事件 (如： _load_, _click_, _touchstart_ 等)。
	- data `对象` 一个JSON对象，用来作为事件的data属性。

	### 例子 ###

		x$('button#reset').fire('click', { died:true });
		
		x$('.target').fire('touchstart');
*/
    fire: function (type, data) {
        return this.each(function (el) {
            if (el == document && !el.dispatchEvent)
                el = document.documentElement;

            var event = document.createEvent('HTMLEvents');
            event.initEvent(type, true, true);
            event.data = data || {};
            event.eventName = type;
          
            el.dispatchEvent(event);
  	    });
  	}
});

"click load submit touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend orientationchange".split(' ').forEach(function (event) {
  xui.fn[event] = function(action) { return function (fn) { return fn ? this.on(action, fn) : this.fire(action); }; }(event);
});

// 屏幕方向支持 - Android 1 不支持原生的onorientationchange事件
xui(window).on('load', function() {
    if (!('onorientationchange' in document.body)) {
      (function (w, h) {
        xui(window).on('resize', function () {
          var portraitSwitch = (window.innerWidth < w && window.innerHeight > h) && (window.innerWidth < window.innerHeight),
              landscapeSwitch = (window.innerWidth > w && window.innerHeight < h) && (window.innerWidth > window.innerHeight);
          if (portraitSwitch || landscapeSwitch) {
            window.orientation = portraitSwitch ? 0 : 90; // what about -90? Some support is better than none
            xui('body').fire('orientationchange'); // will this bubble up?
            w = window.innerWidth;
            h = window.innerHeight;
          }
        });
      })(window.innerWidth, window.innerHeight);
    }
});

// this doesn't belong on the prototype, it belongs as a property on the xui object
xui.touch = (function () {
  try{
    return !!(document.createEvent("TouchEvent").initTouchEvent)
  } catch(e) {
    return false;
  };
})();

/**
	ready
	----

    DOM准备完毕时的事件

	### 语法 ###

		x$.ready(handler);

	### 参数 ###

	- handler `函数` 绑定在DOM准备完毕事件上的事件处理函数。

	### example ###

    x$.ready(function() {
      alert('mah doms are ready');
    });

    xui.ready(function() {
      console.log('ready, set, go!');
    });

*/
xui.ready = function(handler) {
  domReady(handler);
}

// 模仿Prototype的事件模型
function _getEventID(element) {
    if (element._xuiEventID) return element._xuiEventID;
    return element._xuiEventID = ++_getEventID.id;
}

_getEventID.id = 1;

function _getRespondersForEvent(id, eventName) {
    var c = cache[id] = cache[id] || {};
    return c[eventName] = c[eventName] || [];
}

function _createResponder(element, eventName, handler) {
    var id = _getEventID(element), r = _getRespondersForEvent(id, eventName);

    var responder = function(event) {
        if (handler.call(element, event) === false) {
            event.preventDefault();
            event.stopPropagation();
        } 
    };
    
    responder.guid = handler.guid = handler.guid || ++_getEventID.id;
    responder.handler = handler;
    r.push(responder);
    return responder;
}
