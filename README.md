xui-zh_CN-comment
=================

xui是一个用于开发手机网络应用的，极其轻量、易用、微小、模块化的javascript框架。是的，压缩后的代码_非常微小_。你可以在[http://xuijs.com](http://xuijs.com)找到更多的相关信息、下载和文档。

xui-zh_CN-comment是一个基于xui的翻译项目，致力于将xui中的注释翻译成中文，并用joDoc生成完整的中文文档。

获得中文注释的源代码
--------------------

需要完整的中文注释源代码，请使用 _Git_:

    $ git clone git://github.com/surmind/xui-zh_CN-comment.git
    $ cd xui-zh_CN-comment
    $ git submodule init
    $ git submodule update

生成文档
--------

文档根据源代码中内联的注释生成。[joDoc](https://github.com/davebalmer/jodoc)使用注释生成一系列的HTML文件。

生成文档需要用到_Ruby_、_Perl_和_Git_：

    ./build --generate-docs

代码结构
--------

    xui
     |-README.md ................ 你现在在看的正是这个文件!
     |
     |-doc ...................... 应用程序接口文档(由build脚本生成)
     |
     |-lib ...................... Build 文件夹(由build脚本生成)
     | |-xui.js ................. xui核心文件 - 为标准友好的浏览器优化，如webkit
     | |-xui-bb.js .............. 兼容黑莓
     | '-xui-ie.js .............. 兼容IE
     |
     |-packages ................. xui使用的第三方库(gitsubmodules)
     | |-qunit ..................   - 超棒的异步测试库，由John Resig开发
     | |-emile ..................   - 神奇的小型动画库，由Thomas Fuchs开发
     | |-sizzle .................   - 用于jQuery的超赞的选择器引擎，由by John Resig开发
     | '-split.js ...............   - 重写IE的表现糟糕的String.split
     |
     |-spec ..................... 特别的：
     | |-index.html ............. 用qunit和预设的测试用例对生成的js进行测试
     |
     |-src
     | |-base.js ................ 基本的dom节点检索
     | |
     | |-js ..................... 概要：
     | | |-dom.js ...............   - dom节点控制 
     | | |-event.js .............   - 事件监控、触发
     | | |-fx.js ................   - 动画
     | | |-style.js .............   - css hackery
     | | '-xhr.js ...............   - 远程
     | |
     | '-ie
     |   |-dom.js
     |   |-event.js
     |   |-style.js
     |
     '-util ..................... 用于压缩、迷惑、校验等的工具

Creators
--------

- http://github.com/brianleroux
- http://github.com/silentrob
- http://github.com/sintaxi


Contributors
------------

- http://github.com/rmurphey 
- http://github.com/remy
- http://github.com/filmaj
- http://github.com/alunny
- http://github.com/gdagley
- http://github.com/slexaxton
- http://github.com/cluster
- http://github.com/joemccann
- http://github.com/mwbrooks

(If we missed you, please let us know!)

License
-------

_Copyright (c) 2008, 2009, 2010 Brian LeRoux, Brock Whitten, Rob Ellis_

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
