/**
	XHR
	===

    所有和远程网络连接相关的功能

 */
xui.extend({	
/**
	xhr
	---

    经典的`XMLHttpRequest`，就是通常被大家称作_Ajax_的东西。

	### 详情 ###

    这个方法有些新的小把戏

    通常以`html`的行为在元素集上执行

    如果没有定义回调函数，`responseText`会被插入到xui集的元素中

	### 语法 ###

		x$( selector ).xhr( location, url, options )

    或者接收一个url，默认行为为inner

		x$( selector ).xhr( url, options );

    或者接收一个url和回调函数
	
		x$( selector ).xhr( url, fn );

	### 参数 ###

	- location `字符串` 要插入`responseText`的位置。参考DOM中的`html`
	- url `字符串` 向这个位置发送请求。
	- fn `函数` 在响应状态为200的时候执行 (例如成功时的回调函数)。
	- options `对象` 一个JSON对象，由一个或多个下列元素构成：
		- method `字符串` 允许的值有 _get_, _put_, _delete_, _post_。默认为_get_.
		- async `布尔` 启用同步请求。默认为 _false_.
		- data `字符串` 一个url编码的字符串，包含了要发送的参数。
		- callback `函数` 在响应状态为200时执行 (例如成功时的回调函数)。
    - headers `对象` 一个JSON对象，由键值对组成，更改和获取请求头部的设置。

	### 响应 ###

	- 在回调函数中，响应可以通过`this`来引用。
	- 响应没有做为参数传入回调函数。
	- `this.reponseText` 包含了返回的数据。

	### 例子 ###

		x$('#status').xhr('inner', '/status.html');
		x$('#status').xhr('outer', '/status.html');
		x$('#status').xhr('top',   '/status.html');
		x$('#status').xhr('bottom','/status.html');
		x$('#status').xhr('before','/status.html');
		x$('#status').xhr('after', '/status.html');

	或

		// 相当于使用'inner'
		x$('#status').xhr('/status.html');

        // 定义一个回调函数，开启同步执行，增加一个请求头
		x$('#left-panel').xhr('/panel', {
		    async: true,
		    callback: function() {
		        alert("The response is " + this.responseText);
		    },
        headers:{
            'Mobile':'true'
        }
		});

        // 用简写语法定义回调函数
		x$('#left-panel').xhr('/panel', function() {
		    alert("The response is " + this.responseText);
		});
*/
    xhr:function(location, url, options) {

        // 用来保持对旧语法的兼容
		if (!/^(inner|outer|top|bottom|before|after)$/.test(location)) {
            options = url;
            url = location;
            location = 'inner';
        }

        var o = options ? options : {};
        
        if (typeof options == "function") {
            // FIXME kill the console logging
            // console.log('we been passed a func ' + options);
            // console.log(this);
            o = {};
            o.callback = options;
        };
        
        var that   = this,
            req    = new XMLHttpRequest(),
            method = o.method || 'get',
            async  = (typeof o.async != 'undefined'?o.async:true),           
            params = o.data || null,
            key;

        req.queryString = params;
        req.open(method, url, async);

        for (key in o.headers) {
            if (o.headers.hasOwnProperty(key)) {
              req.setRequestHeader(key, o.headers[key]);
            }
        }

        req.handleResp = (o.callback != null) ? o.callback : function() { that.html(location, req.responseText); };
        req.handleError = (o.error && typeof o.error == 'function') ? o.error : function () {};
        function hdl(){ 
            if(req.readyState==4) {
                delete(that.xmlHttpRequest);
                if(req.status===0 || req.status==200) req.handleResp(); 
                if((/^[45]/).test(req.status)) req.handleError();
            }
        }
        if(async) {
            req.onreadystatechange = hdl;
            this.xmlHttpRequest = req;
        }
        req.send(params);
        if(!async) hdl();

        return this;
    }
});
