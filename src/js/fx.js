/**
	Fx
	==

    动画、形变、渐变，让CSS最大限度地发挥硬件性能

*/

xui.extend({

/**
	Tween
	-----

    转变一个CSS属性值

	### 语法 ###

		x$( selector ).tween( properties, callback );

	### 参数 ###

	- properties `对象` 或 `数组`，要进行补间的CSS属性。
	    - `对象` 一个JSON对象，定义了CSS属性。
	    - `数组` 由一个或多个上述的JSON对象顺序排列组成的数组，会顺次执行其中的JSON对象定义的动画效果
	- callback `函数` 动画结束后调用的函数. _(可选)_.

	### properties ###

    properties可以是任何的CSS样式，用JavaScript的形式表现

    properties也可以是[emile.js](https://github.com/madrobby/emile)中的一个

	- duration `数字` 动画持续时间，单位毫秒。
	- after `函数` 动画结束后调用。
	- easing `函数` 允许取代内建的动画函数。

			// 接受参数 `pos` ，标记位置
			// 在动画开始和结束之间的时间
			function(pos) {
			    // 返回新的位置
			    return (-Math.cos(pos * Math.PI) / 2) + 0.5;
			}

	### 例子 ###

		// 一个JSON对象
		x$('#box').tween({ left:'100px', backgroundColor:'blue' });
		x$('#box').tween({ left:'100px', backgroundColor:'blue' }, function() {
		    alert('done!');
		});
		
		// 两个JSON对象组成的数组
		x$('#box').tween([{left:'100px', backgroundColor:'green', duration:.2 }, { right:'100px' }]); 
*/
	tween: function( props, callback ) {

    // 创建一个options对象，用于emile
    var emileOpts = function(o) {
      var options = {};
      "duration after easing".split(' ').forEach( function(p) {
        if (props[p]) {
            options[p] = props[p];
            delete props[p];
        }
      });
      return options;
    }

    // 将properties序列化成一个用于emile的字符串
    var serialize = function(props) {
      var serialisedProps = [], key;
      if (typeof props != string) {
        for (key in props) {
          serialisedProps.push(cssstyle(key) + ':' + props[key]);
        }
        serialisedProps = serialisedProps.join(';');
      } else {
        serialisedProps = props;
      }
      return serialisedProps;
    };

    // 排好队的动画
    /* wtf is this?
		if (props instanceof Array) {
		    // animate each passing the next to the last callback to enqueue
		    props.forEach(function(a){
		      
		    });
		}
    */
    // 这个分支意味着我们在处理一个单一的补间
    var opts = emileOpts(props);
    var prop = serialize(props);
		
		return this.each(function(e){
			emile(e, prop, opts, callback);
		});
	}
});
