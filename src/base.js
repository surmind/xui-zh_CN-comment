/**
	Basics
	======
    
    xui提供全局函数`x$`供开发者使用。该函数能以CSS选择器、DOM元素、由它们构成的数组为参数，
    返回xui对象。例如：
    
        var header = x$('#header'); // 返回id='header'的元素。
        
    如果需要更多关于CSS选择器的信息， 请访问[W3C specification](http://www.w3.org/TR/CSS2/selector.html)。请注意有不同级别的CSS选择器(Levels 1, 2 和 3)
    千万要注意！不同浏览器对CSS选择器有不同程度的支持。
    
	本文档中所描述的函数都是xui对象中的，并且通常情况下对xui集进行操作或以xui集的形式返回信息。

*/
var undefined,
    xui,
    window     = this,
    string     = new String('string'), // prevents Goog compiler from removing primative and subsidising out allowing us to compress further
    document   = window.document,      // obvious really
    simpleExpr = /^#?([\w-]+)$/,   // for situations of dire need. Symbian and the such        
    idExpr     = /^#/,
    tagExpr    = /<([\w:]+)/, // 如此一来你就能即时地创建元素，通过类似 x$('<img href="/foo" /><strong>yay</strong>') 的方式
    slice      = function (e) { return [].slice.call(e, 0); };
    try { var a = slice(document.documentElement.childNodes)[0].nodeType; }
    catch(e){ slice = function (e) { var ret=[]; for (var i=0; e[i]; i++) ret.push(e[i]); return ret; }; }

window.x$ = window.xui = xui = function(q, context) {
    return new xui.fn.find(q, context);
};

// 引入forEach以减少代码量 and avoid over the top currying on event.js and dom.js (shortcuts)
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

xui.fn = xui.prototype = {

/**
	extend
	------

	用另一个对象的成员来扩展XUI的原型。

	### 语法 ###

		xui.extend( object );

	### 参数 ###

	- object `对象` 包含了一些成员，这些成员被添加到XUI的原型。
 
	### 例子 ###

	设有如下代码:

		var sugar = {
		    first: function() { return this[0]; },
		    last:  function() { return this[this.length - 1]; }
		}

    我们可以用`extend`将`sugar`中的成员扩展到xui的原型中：

		xui.extend(sugar);

    然后我们就可以在所有的xui实例中使用`first`和`last`

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

	找出和指定选择器匹配的元素。`x$`是`find`的一个别名。

	### 语法 ###

		x$( window ).find( selector, context );

	### 参数 ###

	- selector `字符串` 一个CSS选择器，作为匹配规则。
	- context `HTML元素` 被查询的父元素_(可选)_.
 
	### 例子 ###

	设有如下代码：

		<ul id="first">
		    <li id="one">1</li>
		    <li id="two">2</li>
		</ul>
		<ul id="second">
		    <li id="three">3</li>
		    <li id="four">4</li>
		</ul>

	我们可以用`find`选出所有列表元素：

		x$('li');                 // 返回所有四个列表元素。
		x$('#second').find('li'); // 返回id为"three"和"four"的列表元素
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
            // 快速匹配纯ID选择器和基于简单元素的选择器
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

	设有如下代码:

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

	用自定义的筛选功能扩展XUI。这是一个内置的工具函数，但是对开发者也同样很有用。

	### 语法 ###

		x$( window ).filter( fn );

	### 参数 ###

	- fn `函数` 被XUI集中的每个元素调用。

	        // `index` 当前元素的在数组中的下标
	        function( index ) {
	            // `this` 当前迭代的元素
	            // 返回true时将元素添加到新的XUI集
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

	与`has`相反的函数。修改元素，返回所有 __不__ 匹配CSS选择器的结果.

	### 语法 ###

		x$( window ).not( selector );

	### 参数 ###

	- selector `字符串` 一个CSS选择器，用来选出所有与它 __不__ 匹配的元素。

	### 例子 ###

	设有如下代码:

		<div>
		    <div class="round">Item one</div>
		    <div class="round">Item two</div>
		    <div class="square">Item three</div>
		    <div class="shadow">Item four</div>
		</div>

	我们可以使用 `not` 选择对象：

		var divs     = x$('div');          // 得到全部的四个div元素。
		var notRound = divs.not('.round'); // 得到那辆个class为 .square 和 .shadow 的元素。
*/
    not: function(q) {
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

    对XUI集合中的元素进行迭代操作

	### 语法 ###

		x$( window ).each( fn )

	### 参数 ###

	- fn `函数` 回调函数，每个元素对其进行一次调用

		    // `element` 当前元素
		    // `index` 当前元素在XUI集合中的序号
		    // `xui` XUI集合
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
