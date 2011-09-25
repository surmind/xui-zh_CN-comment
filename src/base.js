/**
	Basics
	======
    
    xui提供了全局函数`x$`，能以CSS选择器、DOM元素或二者构成的数组为参数，
    返回一个xui对象。如：
    
        var header = x$('#header'); // 返回id='header'的元素。
        
    更多CSS选择器的信息，请访问[W3C specification](http://www.w3.org/TR/CSS2/selector.html)。请注意：w3c定义了不同级别的CSS选择器(等级1, 2 和 3)。
    千万注意，不同浏览器对CSS选择器的支持程度不同。
    
	此文档中描述的函数都是xui对象的方法，并且在通常情况下，这些方法以xui集为操作对象或返回值。

*/
var undefined,
    xui,
    window     = this,
    string     = new String('string'), // prevents Goog compiler from removing primative and subsidising out allowing us to compress further
    document   = window.document,      // 你懂的
    simpleExpr = /^#?([\w-]+)$/,   // for situations of dire need. Symbian and the such        
    idExpr     = /^#/,
    tagExpr    = /<([\w:]+)/, // 如此一来你就能通过类似 x$('<img href="/foo" /><strong>yay</strong>') 的方式动态地创建元素
    slice      = function (e) { return [].slice.call(e, 0); };
    try { var a = slice(document.documentElement.childNodes)[0].nodeType; }
    catch(e){ slice = function (e) { var ret=[]; for (var i=0; e[i]; i++) ret.push(e[i]); return ret; }; }

window.x$ = window.xui = xui = function(q, context) {
    return new xui.fn.find(q, context);
};

// 引入forEach以减少代码量
if (! [].forEach) {
    Array.prototype.forEach = function(fn) {
        var len = this.length || 0,
            i = 0,
            that = arguments[1]; // wait, what's that!? awwww rem. here I thought I knew ya!
                                 // @rem - that that is a hat tip to your thats :)

        if (typeof fn == 'function') {
            for (; i < len; i++) {
                fn.call(that, this[i], i, this);
            }
        }
    };
}
/*
 * 移除数组中的元素 - By John Resig (MIT Licensed) 
 */
function removex(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from: from;
    return array.push.apply(array, rest);
}

// 把CSS样式名转成DOM样式名，如：margin-left转成marginLeft
function domstyle(name) {
  return name.replace(/\-[a-z]/g,function(m) { return m[1].toUpperCase(); });
}

// 把DOM样式名转成CSS样式名，如：marginLeft转成margin-left
function cssstyle(name) {
  return name.replace(/[A-Z]/g, function(m) { return '-'+m.toLowerCase(); })
}

xui.fn = xui.prototype = {

/**
	extend
	------

	用其他对象的成员来扩展xui的原型。

	### 语法 ###

		xui.extend( object );

	### 参数 ###

	- object `对象` 此对象的成员会被添加到xui的原型。
 
	### 例子 ###

	假设有以下代码:

		var sugar = {
		    first: function() { return this[0]; },
		    last:  function() { return this[this.length - 1]; }
		}

    用`extend`将`sugar`的成员扩展到xui的原型中：

		xui.extend(sugar);

    然后就可以在所有的xui实例中使用`first`和`last`

		var f = x$('.button').first();
		var l = x$('.notice').last();
*/
    extend: function(o) {
        for (var i in o) {
            xui.fn[i] = o[i];
        }
    },

/**
	find
	----

	找出和规则匹配的元素。`x$`是`find`的一个别名。

	### 语法 ###

		x$( window ).find( selector, context );

	### 参数 ###

	- selector `字符串` 一个CSS选择器，作为匹配用的规则。
	- context `HTMLElement` 只在这个元素的后代中查询_(可选)_.
 
	### 例子 ###

	假设有以下代码：

		<ul id="first">
		    <li id="one">1</li>
		    <li id="two">2</li>
		</ul>
		<ul id="second">
		    <li id="three">3</li>
		    <li id="four">4</li>
		</ul>

	我们可以用`find`选择所有"li"元素：

		x$('li');                 // 返回所有(4个)"li"元素。
		x$('#second').find('li'); // 返回id为"three"和"four"的"li"元素
*/
    find: function(q, context) {
        var ele = [], tempNode;
            
        if (!q) {
            return this;
        } else if (context == undefined && this.length) {
            ele = this.each(function(el) {
                ele = ele.concat(slice(xui(q, el)));
            }).reduce(ele);
        } else {
            context = context || document;
            // 快速匹配基于ID和标签名称的选择器
            if (typeof q == string) {
              if (simpleExpr.test(q) && context.getElementById && context.getElementsByTagName) {
                  ele = idExpr.test(q) ? [context.getElementById(q.substr(1))] : context.getElementsByTagName(q);
                  // 清空失败的选择结果
                  if (ele[0] == null) { 
                    ele = [];
                  }
              // 对q完全由html标记构成的情况，根据标记生成对应的元素
              } else if (tagExpr.test(q)) {
                  tempNode = document.createElement('i');
                  tempNode.innerHTML = q;
                  slice(tempNode.childNodes).forEach(function (el) {
                    ele.push(el);
                  });
              } else {
                  // 当Sizzle可用时，用它替代querySelectorAll
                  if (window.Sizzle !== undefined) {
                    ele = Sizzle(q, context);
                  } else {
                    ele = context.querySelectorAll(q);
                  }
              }
              // 确保ele成为数组
              ele = slice(ele);
            } else if (q instanceof Array) {
                ele = q;
            } else if (q.toString() == '[object NodeList]' || q.toString() == '[object HTMLCollection]') {
                ele = slice(q);
            } else if (q.nodeName || q === window) { // 将单个的node转换成仅包含一个元素的数组的形式
                ele = [q];
            }
        }
        

        return this.set(ele);
    },

/**
	set
	---

	将对象转化为xui集。

	### 语法 ###

		x$( window ).set( array );
*/
    set: function(elements) {
        var ret = xui();
        ret.cache = slice(this.length ? this : []);
        ret.length = 0;
        [].push.apply(ret, elements);
        return ret;
    },

/**
	reduce
	------

	移除xui对象中的重复元素。

	### 语法 ###

		x$( window ).reduce( elements, index );

	### 参数 ###

	- elements `数组` 一个要移除重复元素的数组 _(可选)_ 。
	- index `数` 移除重复元素的操作到这个下标的元素位置。如果没有定义，则会对所有元素进行操作 _(可选)_ 。
*/
    reduce: function(elements, b) {
        var a = [],
        elements = elements || slice(this);
        elements.forEach(function(el) {
            // 对较早的手机是否支持 [].indexOf 表示怀疑(RS 会用 5800 去测试)
            if (a.indexOf(el, 0, b) < 0)
            a.push(el);
        });

        return a;
    },

/**
	has
	---

    返回能与指定的CSS选择器匹配的元素

	### 语法 ###

		x$( window ).has( selector );

	### 参数 ###

	- selector `字符串` 一个CSS选择器，用来和xui集中的所有子元素进行匹配。

	### 例子 ###

	假设有以下代码:

		<div>
		    <div class="round">Item one</div>
		    <div class="round">Item two</div>
		</div>
	
	我们可以使用`has`选择指定的对象：

		var divs    = x$('div');          // 获取全部的三个div
		var rounded = divs.has('.round'); // 获取那两个 class="round" 的div
*/
     has: function(q) {
         var list = xui(q);
         return this.filter(function () {
             var that = this;
             var found = null;
             list.each(function (el) {
                 found = (found || el == that);
             });
             return found;
         });
     },

/**
	filter
	------

	用自定义的筛选功能扩展xui。这是一个内置的工具函数，但是对开发者也同样很有用。

	### 语法 ###

		x$( window ).filter( fn );

	### 参数 ###

	- fn `函数` 被xui集中的每个元素调用。

	        // `index` 当前元素的在数组中的下标
	        function( index ) {
	            // `this` 当前迭代的元素
	            // 返回true时将元素添加到新的xui集
	        }

	### 例子 ###

	筛选出disabled的`<input />`元素

		x$('input').filter(function(index) {
		    return this.checked;
		});
*/
    filter: function(fn) {
        var elements = [];
        return this.each(function(el, i) {
            if (fn.call(el, i)) elements.push(el);
        }).set(elements);
    },

/**
	not
	---

	与`has`相反的函数。返回与CSS选择器 __不__ 匹配的元素。

	### 语法 ###

		x$( window ).not( selector );

	### 参数 ###

	- selector `字符串` 一个CSS选择器，用来选出所有与它 __不__ 匹配的元素。

	### 例子 ###

	假设有以下代码:

		<div>
		    <div class="round">Item one</div>
		    <div class="round">Item two</div>
		    <div class="square">Item three</div>
		    <div class="shadow">Item four</div>
		</div>

	我们可以使用 `not` 选择对象：

		var divs     = x$('div');          // 得到全部的四个div元素。
		var notRound = divs.not('.round'); // 得到那两个class为 .square 和 .shadow 的元素。
*/
    not: function(q) {
        var list = slice(this),
            omittedNodes = xui(q);
        if (!omittedNodes.length) {
            return this;
        var list = slice(this);
        return this.filter(function(i) {
            var found;
            xui(q).each(function(el) {
                return found = list[i] != el;
            });
            return found;
        });
    },

/**
	each
	----

    对xui集合中的元素进行迭代操作

	### 语法 ###

		x$( window ).each( fn )

	### 参数 ###

	- fn `函数` 回调函数，每个元素对其进行一次调用

		    // `element` 当前元素
		    // `index` 当前元素在xui集合中的序号
		    // `xui` xui集合
		    function( element, index, xui ) {
		        // `this` 当前元素
		    }

	### 例子 ###

		x$('div').each(function(element, index, xui) {
		    alert("Here's the " + index + " element: " + element);
		});
*/
    each: function(fn) {
        // 通过使用[].forEach.call我们还能压缩这里的代码 - but we wouldn't be able to support
        // fn 返回 false 时终止循环，这是一个我非常喜欢的特性
        for (var i = 0, len = this.length; i < len; ++i) {
            if (fn.call(this[i], this[i], i, this) === false)
            break;
        }
        return this;
    }
};

xui.fn.find.prototype = xui.fn;
xui.extend = xui.fn.extend;
