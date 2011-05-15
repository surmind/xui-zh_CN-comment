/**
	DOM
	===

    一批操作DOM的方法

*/
xui.extend({
/**
	html
	----

    通过DOM操作HTML。也可以不带参数地调用，以获取元素的内部HTML

	### 语法 ###

		x$( window ).html( location, html );

    或者通过传入一个段HTML来改变内部HTML

		x$( window ).html( html );

    也可以使用简写语法，把参数location的可接受的名称直接作为函数名

		x$( window ).outer( html );
		x$( window ).before( html );
	
    或者用下面的语法来获取内部HTML
	
	    x$( document.body ).html();

	### 参数 ###

	- location `字符串` 可以是: _inner_, _outer_, _top_, _bottom_, _remove_, _before_ or _after_.
	- html `字符串` 一段HTML标记语言或一个`HTMLElement`.

	### 例子 ###

		x$('#foo').html('inner', '<strong>rock and roll</strong>');
		x$('#foo').html('outer', '<p>lock and load</p>');
		x$('#foo').html('top',   '<div>bangers and mash</div>');
		x$('#foo').html('bottom','<em>mean and clean</em>');
		x$('#foo').html('remove');
		x$('#foo').html('before', '<p>some warmup html</p>');
		x$('#foo').html('after',  '<p>more html!</p>');

	或

		x$('#foo').html('<p>sweet as honey</p>');
		x$('#foo').outer('<p>free as a bird</p>');
		x$('#foo').top('<b>top of the pops</b>');
		x$('#foo').bottom('<span>bottom of the barrel</span>');
		x$('#foo').before('<pre>first in line</pre>');
		x$('#foo').after('<marquee>better late than never</marquee>');
*/
    html: function(location, html) {
        clean(this);

        if (arguments.length == 0) {
            var i = [];
            this.each(function(el) {
                i.push(el.innerHTML);
            });
            return i;
        }
        if (arguments.length == 1 && arguments[0] != 'remove') {
            html = location;
            location = 'inner';
        }
        if (location != 'remove' && html && html.each !== undefined) {
            if (location == 'inner') {
                var d = document.createElement('p');
                html.each(function(el) {
                    d.appendChild(el);
                });
                this.each(function(el) {
                    el.innerHTML = d.innerHTML;
                });
            } else {
                var that = this;
                html.each(function(el){
                    that.html(location, el);
                });
            }
            return this;
        }
        return this.each(function(el) {
            var parent, 
                list, 
                len, 
                i = 0;
            if (location == "inner") { // .html
                if (typeof html == string || typeof html == "number") {
                    el.innerHTML = html;
                    list = el.getElementsByTagName('SCRIPT');
                    len = list.length;
                    for (; i < len; i++) {
                        eval(list[i].text);
                    }
                } else {
                    el.innerHTML = '';
                    el.appendChild(html);
                }
            } else if (location == "outer") { // .replaceWith
                el.parentNode.replaceChild(wrapHelper(html, el), el);
            } else if (location == "top") { // .prependTo
                el.insertBefore(wrapHelper(html, el), el.firstChild);
            } else if (location == "bottom") { // .appendTo
                el.insertBefore(wrapHelper(html, el), null);
            } else if (location == "remove") {
                el.parentNode.removeChild(el);
            } else if (location == "before") { // .insertBefore
                el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el);
            } else if (location == "after") { // .insertAfter
                el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el.nextSibling);
            }
        });
    },

/**
	attr
	----

    获取或设置元素的属性。获取时，返回一个属性数组，包含元素集中所有匹配的属性
	Gets or sets attributes on elements. If getting, returns an array of attributes matching the xui element collection's indices.

	### 语法 ###

		x$( window ).attr( attribute, value );

	### 参数 ###

	- attribute `字符串` 想要获取或设置的HTML属性名称。
	- value `Varies` 想要设置的属性值。获取属性时不要使用这个参数_(可选)_。

	### 例子 ###

    用作获取一个属性值，只要别传入第二个可选参数就可以了：

		x$('.someClass').attr('class');

	用作设置一个属性，就传入两个参数：

		x$('.someClass').attr('disabled', 'disabled');
*/
    attr: function(attribute, val) {
        if (arguments.length == 2) {
            return this.each(function(el) {
                (el.setAttribute?(attribute=='checked'&&(val==''||val==false||typeof val=="undefined"))?el.removeAttribute(attribute):el.setAttribute(attribute, val):0);
            });
        } else {
            var attrs = [];
            this.each(function(el) {
                if (el.getAttribute) {
                    attrs.push(el.getAttribute(attribute));
                }
            });
            return attrs;
        }
    }
});
"inner outer top bottom remove before after".split(' ').forEach(function (method) {
  xui.fn[method] = function(where) { return function (html) { return this.html(where, html); }; }(method);
});
// 查找DOM元素的私有函数
function getTag(el) {
    return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
}

function wrapHelper(html, el) {
  return (typeof html == string) ? wrap(html, getTag(el)) : html;
}

// 私有方法
// 把html包在一个tag标签里，tag是可选的
// 如果参数xhtml以一个tag作为开头，就将内容包含在那个tag中
function wrap(xhtml, tag) {

    var attributes = {},
        re = /^<([A-Z][A-Z0-9]*)([^>]*)>([\s\S]*)<\/\1>/i,
        element,
        x,
        a,
        i = 0,
        attr,
        node,
        attrList,
        result;
        
    if (re.test(xhtml)) {
        result = re.exec(xhtml);
        tag = result[1];

        // if the node has any attributes, convert to object
        if (result[2] !== "") {
            attrList = result[2].split(/([A-Z\-]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);

            for (; i < attrList.length; i++) {
                attr = attrList[i].replace(/^\s*|\s*$/g, "");
                if (attr !== "" && attr !== " ") {
                    node = attr.split('=');
                    attributes[node[0]] = node[1].replace(/(["']?)/g, '');
                }
            }
        }
        xhtml = result[3];
    }

    element = document.createElement(tag);

    for (x in attributes) {
        a = document.createAttribute(x);
        a.nodeValue = attributes[x];
        element.setAttributeNode(a);
    }

    element.innerHTML = xhtml;
    return element;
}


/*
* 从DOM中移除所有错误的节点，译注：看代码应该是移除了空的文本节点
* 
*/
function clean(collection) {
    var ns = /\S/;
    collection.each(function(el) {
        var d = el,
            n = d.firstChild,
            ni = -1,
            nx;
        while (n) {
            nx = n.nextSibling;
            if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
                d.removeChild(n);
            } else {
                n.nodeIndex = ++ni; // FIXME not sure what this is for, and causes IE to bomb (the setter) - @rem
            }
            n = nx;
        }
    });
}
