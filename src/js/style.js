/**
	Style
	=====

    所有和表现有关的东西，大多数情况下，就是CSS

*/
function hasClass(el, className) {
    return getClassRegEx(className).test(el.className);
}

// Via jQuery - used to avoid el.className = ' foo';
// 用来移除空白字符
var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

function trim(text) {
  return (text || "").replace( rtrim, "" );
}

xui.extend({
/**
	setStyle
	--------

    设置一个单一的CSS属性

	### 语法 ###

		x$( selector ).setStyle( property, value );

	### 参数 ###

	- property `字符串` 要修改的属性的名称。
	- value `字符串` 属性新的值。

	### 例子 ###

		x$('.flash').setStyle('color', '#000');
		x$('.button').setStyle('backgroundColor', '#EFEFEF');
*/
    setStyle: function(prop, val) {
        prop = domstyle(prop);
        return this.each(function(el) {
            el.style[prop] = val;
        });
    },

/**
	getStyle
	--------

    返回一个CSS属性的值。允许执行一个回调函数对该值进行特定处理。
    请注意返回值永远是一个数组，数组内的元素为字符串。每个字符串依次对应xui集中各元素相应属性的值

	### 语法 ###

		x$( selector ).getStyle( property, callback );

	### 参数 ###

	- property `字符串` 要获取的CSS属性的名称。
	- callback `函数` 对xui集中的每个元素调用此函数，并传入property做为参数_(可选)_.

	### 例子 ###
        <ul id="nav">
            <li class="trunk" style="font-size:12px;background-color:blue;">hi</li>
            <li style="font-size:14px;">there</li>
        </ul>
        
		x$('ul#nav li.trunk').getStyle('font-size'); // returns ['12px']
		x$('ul#nav li.trunk').getStyle('fontSize'); // returns ['12px']
		x$('ul#nav li').getStyle('font-size'); // returns ['12px', '14px']
		
		x$('ul#nav li.trunk').getStyle('backgroundColor', function(prop) {
		    alert(prop); // alerts 'blue' 
		});
*/
    getStyle: function(prop, callback) {
        // shortcut getComputedStyle function
        var s = function(el, p) {
            // this *can* be written to be smaller - see below, but in fact it doesn't compress in gzip as well, the commented
            // out version actually *adds* 2 bytes.
            // return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/([A-Z])/g, "-$1").toLowerCase());
            return document.defaultView.getComputedStyle(el, "").getPropertyValue(cssstyle(p));
        }
        if (callback === undefined) {
        	var styles = [];
            this.each(function(el) {styles.push(s(el, prop))});
 			return styles;
        } else this.each(function(el) { callback(s(el, prop)); });
    },

/**
	addClass
	--------

    给元素集中的每个元素增加一个class

	### 语法 ###

		x$( selector ).addClass( className );

	### 参数 ###

	- className `字符串` 要添加的CSS类的名称。

	### 例子 ###

		x$('.foo').addClass('awesome');
*/
    addClass: function(className) {
        return this.each(function(el) {
            if (hasClass(el, className) === false) {
              el.className = trim(el.className + ' ' + className);
            }
        });
    },

/**
	hasClass
	--------

    检查是否xui集中的_所有_元素都有这个class。

	### 语法 ###

		x$( selector ).hasClass( className, fn );

	### 参数 ###

	- className `字符串` 要找的CSS类的名称。
	- fn `函数` 每个匹配的元素都会调用这个函数，并把自己作为该函数的参数_(可选)_。
			// `element` 拥有该class的HTMLElement
			function(element) {
			    console.log(element);
			}

	### 例子 ###
        <div id="foo" class="foo awesome"></div>
        <div class="foo awesome"></div>
        <div class="foo"></div>
        
		// returns true
		x$('#foo').hasClass('awesome');
		
		// returns false (不是所有带类'foo'的元素都有类'awesome')，
		// 但回调函数仍会对每个带类'awesome'的元素执行
		x$('.foo').hasClass('awesome', function(element) {
		    console.log('Hey, I found: ' + element + ' with class "awesome"');
		});
		
		// returns true (所有div元素都有类'foo')
		x$('div').hasClass('foo');
*/
    hasClass: function(className, callback) {
        var self = this;
        return this.length && (function() {
                var hasIt = true;
                self.each(function(el) {
                    if (hasClass(el, className)) {
                        if (callback) callback(el);
                    } else hasIt = false;
                });
                return hasIt;
            })();
    },

/**
	removeClass
	-----------

    移除xui集的元素中的指定class。如果没有指定一个特定的class，移除所有class

	### 语法 ###

		x$( selector ).removeClass( className );

	### 参数 ###

	- className `字符串` 要移除的CSS class的名称。如果没有指定，从所有匹配的元素中移除所有class_(可选)_

	### 例子 ###

		x$('.foo').removeClass('awesome');
*/
    removeClass: function(className) {
        if (className === undefined) this.each(function(el) { el.className = ''; });
        else this.each(function(el) { el.className = trim(el.className.replace(getClassRegEx(className), '$1')); });
        return this;
    },

/**
	toggleClass
	-----------

    针对xui集中的元素，如果指定的类存在则移除，不存在则添加

	### 语法 ###

		x$( selector ).toggleClass( className );

	### 参数 ###

	- className `字符串` 要转换的CSS类的名称。

	### 例子 ###
        <div class="foo awesome"></div>
        
		x$('.foo').toggleClass('awesome'); // div above loses its awesome class.
*/
    toggleClass: function(className) {
        return this.each(function(el) {
            if (hasClass(el, className)) el.className = trim(el.className.replace(getClassRegEx(className), '$1'));
            else el.className = trim(el.className + ' ' + className);
        });
    },
    
/**
	css
	---

    一次设置多个CSS属性

	### 语法 ###

		x$( selector ).css( properties );

	### 参数 ###

	- properties `对象` 一个JSON对象，定义了要设置的键值对。

	### 例子 ###

		x$('.foo').css({ backgroundColor:'blue', color:'white', border:'2px solid red' });
*/
    css: function(o) {
        for (var prop in o) {
            this.setStyle(prop, o[prop]);
        }
        return this;
    }
});

// RS: now that I've moved these out, they'll compress better, however, do these variables
// need to be instance based - if it's regarding the DOM, I'm guessing it's better they're
// global within the scope of xui

// -- private methods -- //
var reClassNameCache = {},
    getClassRegEx = function(className) {
        var re = reClassNameCache[className];
        if (!re) {
            // Preserve any leading whitespace in the match, to be used when removing a class
            re = new RegExp('(^|\\s+)' + className + '(?:\\s+|$)');
            reClassNameCache[className] = re;
        }
        return re;
    };
