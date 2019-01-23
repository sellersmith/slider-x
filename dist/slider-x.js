!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.SliderX=e():t.SliderX=e()}(window,function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(n,s,function(e){return t[e]}.bind(null,s));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=1)}([function(t,e){!function(t){var e,i,n,s,r,a,o,l,d,c,h,u,f,p,v,y,g,S,m;function b(l){if(l.target.classList.contains("jsn-es-draggable"))v=t(l.target);else{var d=function(t){var e=t.parentNode,i=null;for(;e&&!i&&!e.isEqualNode(document.body);)e.classList&&e.classList.contains("jsn-es-draggable")?i=e:e=e.parentNode;return i}(l.target);if(!d)return;v=t(d)}if(!y){switch(c=Date.now(),m={},l.type){case"mousedown":if(S)return;e=l.pageX,i=l.pageY,l.preventDefault();break;case"touchstart":if(1!=l.touches.length)return;e=l.touches[0].clientX,i=l.touches[0].clientY}n=0,s=0,r=0,a=0,p=null,0,o="none",f="none",y=!0}}function x(l){if(y){switch(l.type){case"mousemove":if(S)return;var d=l.pageX,u=l.pageY;l.preventDefault();break;case"touchmove":if(1!=l.touches.length)return;d=l.touches[0].clientX,u=l.touches[0].clientY}Date.now(),r+=n=d-e,a+=s=u-i,e=d,i=u,p||(f=Math.abs(r)>Math.abs(a)?"x":Math.abs(r)<Math.abs(a)?"y":"none",Math.max(Math.abs(r),Math.abs(a))>50&&(p=!0)),o=Math.abs(n)>=Math.abs(s)?n>0?"right":n<0?"left":"none":s>0?"down":s<0?"up":"none",g||(g=!0,v.trigger(D("es_dragstart",l),O()),t("body").add(v).addClass("jsn-es-draggable-dragging")),g&&(h=Date.now(),$(),c=Date.now(),v.trigger(D("es_dragmove",l),O()))}}function w(e){if(y){switch(e.type){case"touchend":case"touchcancel":if(e.touches.length)return}y=!1,g&&(h=Date.now(),$(),g=!1,t("body").add(v).removeClass("jsn-es-draggable-dragging"),v.trigger(D("es_dragstop",e),O()),v.removeData("jsn-es-draggable-data"))}}function $(){u=h-c,l=Math.abs(n/u),d=Math.abs(s/u)}function O(){var t=m;return t.direction=o,t.axis=f,t.deltaX=n,t.deltaY=s,t.moveX=r,t.moveY=a,t.velocityX=l,t.velocityY=d,m=t,t}function P(t,e,i,n){return t.addEventListener?t.addEventListener(e,i,n):t.attachEvent?t.attachEvent(e,i,n):void 0}function D(e,i){var n={};return n.originalEvent=i,n.preventDefault=i.preventDefault.bind(i),n.stopPropagation=i.stopPropagation.bind(i),t.Event(e,n)}t(window).one("touchstart",function(t){S=!0}),t(document).ready(function(){P(document.body,"touchstart",b),P(document.body,"touchmove",x),P(document.body,"touchend",w),P(document.body,"touchcancel",w),P(document.body,"mousedown",b),P(document.body,"mousemove",x),P(document.body,"mouseup",w),P(document.body,"blur",w),t(window).on("mouseout",function(t){t.toElement||w(t)})})}(jQuery)},function(t,e,i){"use strict";function n(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}i.r(e);var s=function(t,e){return t.map(function(t){return function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{},s=Object.keys(i);"function"==typeof Object.getOwnPropertySymbols&&(s=s.concat(Object.getOwnPropertySymbols(i).filter(function(t){return Object.getOwnPropertyDescriptor(i,t).enumerable}))),s.forEach(function(e){n(t,e,i[e])})}return t}({},t,{index:t.index%e})})},r={wrapper:"".concat("pf","-slider-wrapper"),inner:"".concat("pf","-slider-inner"),slide:"".concat("pf","-slider-slide"),indicators:"".concat("pf","-slider-pagination"),indicatorItem:"".concat("pf","-slider-pagination-item"),controller:"".concat("pf","-slider-nav"),disabledCtrl:"".concat("pf","-slider-nav-disabled"),nextCtrl:"".concat("pf","-next-nav"),prevCtrl:"".concat("pf","-prev-nav"),turnOffMouseEvent:"".concat("pf","-slider-mouse-event-off")},a=function(t,e,i){var n=t.totalSlide;n*=3;for(var r,a=t.$slider.width(),l=o(t),d=t.opts,c=d.curr,h=d.slidesToShow,u=d.slidesToScroll,f=d.gutter,p=[],v=0;v<h;v++)p.push((c+v)%n);var y,g=[],S=[],m=[];if("next"===e){var b;y=void 0!==i?p.includes(i)?p.indexOf(i)-p.indexOf(c):h:u,r=void 0!==i?i:(c+u)%n,b=p.includes(r)?t.$slider.children().eq(r).position().left:a+f;for(var x=0;x<h;x++){var w=b+(l+f)*x;p.includes((r+x)%n)||g.push({index:r+x,readyX:w}),S.push({index:r+x,newX:w-(f+l)*y})}}else if("prev"===e){if(void 0!==i){var $=(i+h-1)%n;y=p.includes($)?p.indexOf((c+h-1)%n)-p.indexOf($):h}else y=u;var O;r=void 0!==i?i:(n+(c-u))%n,O=p.includes((r+h-1)%n)?t.$slider.children().eq((r+h-1)%n).position().left:-(l+f);for(var P=0;P<h;P++){var D=O-(l+f)*(h-P-1);p.includes((r+P)%n)||g.push({index:r+P,readyX:D}),S.push({index:r+P,newX:D+(f+l)*y})}}for(var k=0;k<h;k++){var C=t.$slider.children().eq((c+k)%n).position().left,T=void 0;if("next"===e?T=C-(f+l)*y:"prev"===e&&(T=C+(f+l)*y),t.moveByDrag){var M=t.$slider.children().eq(c%n).position().left;"prev"===e?T=C+(a-M)+f:"next"===e&&(T=C-(a+M)-f)}m.push({index:c+k,newX:T})}return g=s(g,n),S=s(S,n),{nextIndex:r,nextSlidesReadyPos:g,currSlidesNewPos:m=s(m,n),nextSlidesNewPos:S}},o=function(t){var e=t.opts,i=e.gutter,n=e.slidesToShow;return(t.sliderWidth-i*(n-1))/n};function l(t){return(l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function d(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.d(e,"PageFlySliderController",function(){return b}),i(0);var c=window.jQuery,h=r.wrapper,u=r.inner,f=r.slide,p=r.indicators,v=r.controller,y=r.nextCtrl,g=r.prevCtrl,S=r.disabledCtrl,m=r.turnOffMouseEvent,b=function(){function t(e,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.el=e,this.originalStyles={wrapper:"",inner:[]},this.$el=c(this.el),this.$slider=null,this.sliderHeight=this.$el.get(0).offsetHeight,console.log("this.$el",this.$el.get(0).offsetHeight),this.sliderWidth=null,this.totalSlide=this.$el.children().length,this.opts=c.extend({},i),this.autoPlayTimeoutId="",this.initialize()}var e,i,n;return e=t,(i=[{key:"getWrapperWidthThenInit",value:function(){var t,e=this,i=this.$el,n=i.css("background-image").slice(4,-1).replace(/"/g,""),s=new Image;s.src=n,s.onload=function(){t=i.get(0).offsetWidth,e.sliderWidth=t,e.initialize(),console.log(9696,e.sliderWidth)}}},{key:"initialize",value:function(){var t=this;return this.opts.curr=0,this.verifyOptions(),this.$el.on("click",this.handleClick.bind(this)),this.setupSliderDOM(),this.moveByDrag=!1,this.missingSlidesOnDrag=!1,this.$slider.on("es_dragmove",this.handleDragMove.bind(this)),this.$slider.on("es_dragstop",this.handleDragStop.bind(this)),this.setAutoPlay(),c(window).resize(function(e){return t.handleResize(e)}),this.$el.data("pf-slider-x",this),this.$el.attr("data-slider-x-init","init-ed"),console.info("New PageFly Slider initialized!!!",this),this}},{key:"setupSliderDOM",value:function(){var t=this,e=this.$el;e.addClass(h),this.originalStyles.wrapper=e.attr("style")?e.attr("style"):"";var i=c("<div></div>");e.children().each(function(e,n){var s=c(n).attr("style")?c(n).attr("style"):"";t.originalStyles.inner.push(s),i.append(n)}),this.$slider=i;for(var n=c("<a data-action='next'></a>"),s=c("<a data-action='prev'></a>"),r=c("<ol>"),a=0;a<this.totalSlide;a++){var o=c("<li data-goto-slide=".concat(a," data-action='goto'></li>"));r.append(o)}e.append(i).append(r).append(s).append(n),this.cloneSlide();var l=e.css("background-image").slice(4,-1).replace(/"/g,""),d=function i(){t.sliderWidth=e.get(0).offsetWidth,t.sliderWidth?(t.updateSliderStyle(),t.udpateActiveSlideStyle()):setTimeout(i,100)};if(l){var u=new Image;u.src=l,u.onload=function(){d()}}else d()}},{key:"cloneSlide",value:function(){for(var t=this.$slider.children().length,e=0;e<t;e++){this.$slider.children().eq(e).clone().attr("data-slide-clone",!0).appendTo(this.$slider)}for(var i=0;i<t;i++){this.$slider.children().eq(i).clone().attr("data-slide-clone",!0).appendTo(this.$slider)}}},{key:"handleResize",value:function(t){var e=this.opts,i=e.curr,n=e.slidesToShow,s=e.gutter,r=this.totalSlide;r*=3;var a=o(this),l=this.$slider.children();l.css({width:"".concat(a,"px"),transition:""}),l.eq((i+n)%r).css({transform:"translate3d(".concat(this.$slider.width(),"px, 0, 0)")}),l.eq((r+(i-1))%r).css({transform:"translate3d(".concat(-a-s,"px, 0, 0)")});for(var d=i;d<i+n;d++){l.eq(d%r).css({transform:"translate3d(".concat((a+s)*(d-i),"px, 0, 0)")})}this.sliderWidth=this.$el.get(0).offsetWidth}},{key:"handleClick",value:function(t){switch(t.target.getAttribute("data-action")){case"next":this.next();break;case"prev":this.prev();break;case"goto":var e=parseInt(t.target.getAttribute("data-goto-slide"))||0;this.goto(e);break;default:console.log("Slider clicked")}}},{key:"handleStyleChange",value:function(t){var e=this;t.forEach(function(t){var i=c(t.target).get(0).offsetHeight();i!==e.opts.height&&e.updateOptions({height:i})})}},{key:"handleDragMove",value:function(e,i){var n=this;if(!(Math.abs(i.moveX)<t.constructor.MIN_DRAG_DISTANCE)){this.clearAutoPlay();var s=i.moveX,r=this.opts,l=r.curr,d=r.slidesToShow,c=r.gutter,h=r.loop,u=(l+d)%(3*this.totalSlide),f=a(this,"next",u).nextSlidesReadyPos;h||(f=f.filter(function(t){return t.index<n.totalSlide}));for(var p=[],v=o(this),y=0;y<d;y++)p.push({index:(y+l)%(3*this.totalSlide),readyX:(v+c)*y});var g=(3*this.totalSlide+(l-d))%(3*this.totalSlide),S=a(this,"prev",g).nextSlidesReadyPos;if(h||(S=S.filter(function(t){return t.index<n.totalSlide})),(0!==l||this.opts.loop||!(s>0))&&!(l+d>=this.totalSlide&&!this.opts.loop&&s<0)){var m=!0,b=!1,x=void 0;try{for(var w,$=S[Symbol.iterator]();!(m=(w=$.next()).done);m=!0){var O=w.value,P=this.$slider.children().eq(O.index);this.translateSlide(P,O.readyX+s)}}catch(t){b=!0,x=t}finally{try{m||null==$.return||$.return()}finally{if(b)throw x}}for(var D=0;D<p.length;D++){var k=p[D],C=this.$slider.children().eq(k.index);this.translateSlide(C,k.readyX+s)}var T=!0,M=!1,j=void 0;try{for(var X,q=f[Symbol.iterator]();!(T=(X=q.next()).done);T=!0){var A=X.value,E=this.$slider.children().eq(A.index);this.translateSlide(E,A.readyX+s)}}catch(t){M=!0,j=t}finally{try{T||null==q.return||q.return()}finally{if(M)throw j}}}}}},{key:"handleDragStop",value:function(e,i){if(!(Math.abs(i.moveX)<t.constructor.MIN_DRAG_DISTANCE)){this.moveByDrag=!0;var n,s=i.velocityX,r=i.moveX/this.sliderWidth,a="",o=this.totalSlide,l=this.opts,d=l.loop,c=l.curr,h=l.slidesToShow,u=l.duration,f=Math.abs(r)*u;if(s>1||Math.abs(r)>.3){if(!d){if(r<0&&c+2*h>o)return a="prev",n=o-h,this.missingSlidesOnDrag=!0,void this.moveSlide(a,n,f);if(r>0&&c-h<0)return a="next",n=0,this.missingSlidesOnDrag=!0,void this.moveSlide(a,n,f)}f=u-f,r<0?a="next":r>0&&(a="prev")}else r<0?(this.opts.curr+=h,a="prev"):r>0&&(this.opts.curr=3*o+(c-h),a="next"),this.opts.curr%=3*o;n="next"===a?this.opts.curr+h:3*o+(this.opts.curr-h),n%=3*o,this.moveSlide(a,n,f)}}},{key:"verifyOptions",value:function(){var t=this.constructor.defaultOptions;for(var e in t){var i=t[e];l(this.opts[e])!==l(i)&&(this.opts[e]=i)}this.opts.height=this.sliderHeight||this.opts.height,this.opts.loop||(this.opts.autoPlay=!1),1===this.opts.slidesToShow&&(this.opts.gutter=0);var n=this.constructor.styleOptions.paginations,s=this.constructor.styleOptions.navs;n.indexOf(this.opts.paginationStyle)<0&&(this.opts.paginationStyle=n[0]),s.indexOf(this.opts.navStyle)<0&&(this.opts.navStyle=s[0])}},{key:"updateOptions",value:function(t){var e=this.constructor.defaultOptions,i=this.constructor.styleOptions.paginations,n=this.opts.paginationStyle,s=this.constructor.styleOptions.navs,r=this.opts.navStyle;for(var a in t)if(l(t[a])===l(e[a])&&"curr"!==a){var o=t[a];"paginationStyle"===a&&i.indexOf(t[a])<0&&(o=n),"navStyle"===a&&s.indexOf(t[a])<0&&(o=r),this.opts[a]=o}this.opts.loop||(this.opts.autoPlay=!1),this.destroy(),this.initialize()}},{key:"setAutoPlay",value:function(){var t=this;this.opts.autoPlay&&(this.autoPlayTimeoutId=setTimeout(function(){t.moveSlide("next")},this.opts.autoPlayDelay))}},{key:"clearAutoPlay",value:function(){clearTimeout(this.autoPlayTimeoutId)}},{key:"destroy",value:function(){var t=this;console.log("333 destroy"),this.clearAutoPlay(),this.$slider.find("*[data-slide-clone=true]").remove();var e=[];this.$slider.children().each(function(i,n){c(n).removeClass(f).removeClass("active").attr("style","").attr("style",t.originalStyles.inner[i]),e.push(c(n))}),this.$el.removeClass(h).attr("style","").attr("style",this.originalStyles.wrapper),this.$el.off("click"),this.$el.attr("data-slider-x-init",null),this.$el.data("pf-slider-x",null),this.$el.data("pf-slider-initialized",null),this.$el.empty();for(var i=0;i<e.length;i++){var n=e[i];this.$el.append(n)}console.log("Removed slider-x !!")}},{key:"moveSlide",value:function(t,e,i){var n=this;this.clearAutoPlay();var s=this.opts,r=s.curr,o=s.slidesToShow;if(s.loop||this.moveByDrag||!("prev"===t&&0===r||"next"===t&&r+o-1>=this.totalSlide-1||"next"===t&&e+o-1>this.totalSlide-1)){this.$el.addClass(m);var l=a(this,t,e),d=l.nextIndex,c=l.nextSlidesReadyPos,h=l.currSlidesNewPos,u=l.nextSlidesNewPos;if(!this.moveByDrag){var f=!0,p=!1,v=void 0;try{for(var y,g=c[Symbol.iterator]();!(f=(y=g.next()).done);f=!0){var S=y.value,b=this.$slider.children().eq(S.index);this.translateSlide(b,S.readyX)}}catch(t){p=!0,v=t}finally{try{f||null==g.return||g.return()}finally{if(p)throw v}}}this.updateSliderCtrlStyle(d);var x=i||this.opts.duration;setTimeout(function(){if(!n.missingSlidesOnDrag){var t=!0,e=!1,i=void 0;try{for(var s,r=h[Symbol.iterator]();!(t=(s=r.next()).done);t=!0){var a=s.value,o=n.$slider.children().eq(a.index);n.translateSlide(o,a.newX,x)}}catch(t){e=!0,i=t}finally{try{t||null==r.return||r.return()}finally{if(e)throw i}}}var l=!0,d=!1,c=void 0;try{for(var f,p=u[Symbol.iterator]();!(l=(f=p.next()).done);l=!0){var v=f.value,y=n.$slider.children().eq(v.index);n.translateSlide(y,v.newX,x)}}catch(t){d=!0,c=t}finally{try{l||null==p.return||p.return()}finally{if(d)throw c}}setTimeout(function(){n.setAutoPlay(),n.$el.removeClass(m),n.moveByDrag=!1,n.missingSlidesOnDrag=!1},x)},50),this.opts.curr=d,this.udpateActiveSlideStyle()}else this.moveByDrag=!1}},{key:"translateSlide",value:function(t,e,i){i?t.css({transition:"transform ".concat(i,"ms linear")}):t.css({transition:""}),t.css("transform","translate3d(".concat(e,"px, 0, 0)"))}},{key:"next",value:function(){var t=this.opts,e=t.curr,i=t.loop,n=t.slidesToScroll,s=t.slidesToShow,r=this.totalSlide;i?this.moveSlide("next"):e+n+s>=r?this.goto(r-s):this.moveSlide("next")}},{key:"prev",value:function(){var t=this.opts,e=t.curr,i=t.loop,n=t.slidesToScroll;i?this.moveSlide("prev"):e-n<=0?this.goto(0):this.moveSlide("prev")}},{key:"goto",value:function(t){t>this.opts.curr?this.moveSlide("next",t):t<this.opts.curr&&this.moveSlide("prev",t)}},{key:"updateSliderStyle",value:function(){var t=this.$slider.children(),e=t.eq(this.opts.curr),i=o(this);console.log("aaaa",this.sliderWidth,i);var n=this.opts,s=n.adaptiveHeight;n.height;s?(t.css({height:""}),this.$el.css("transition","height ".concat(this.opts.duration,"ms ease-in-out")),this.$slider.css("transition","height ".concat(this.opts.duration,"ms ease-in-out")),this.$el.css("height",""),this.$slider.css("height","".concat(e.height(),"px"))):(t.css({height:"100%",width:"".concat(i,"px")}),this.$slider.css({height:"100%",transition:""}),this.$el.css({transition:""})),t.addClass(f);for(var r=this.opts.gutter,a=0;a<t.length;a++){var l=a*(i+r);t.eq(a).css({transform:"translate3d(".concat(l,"px, 0, 0)")})}this.$slider.addClass(u),this.opts.draggable?this.$slider.addClass("jsn-es-draggable"):this.$slider.removeClass("jsn-es-draggable");var d=this.opts.navStyle,c=this.opts.paginationStyle;this.$el.children('a[data-action="next"]').attr("class","").attr("class","".concat(y," ").concat(v," ").concat(d)),this.$el.children('a[data-action="prev"]').attr("class","").attr("class","".concat(g," ").concat(v," ").concat(d)),this.$el.children("ol").attr("class","").attr("class","".concat(p," ").concat(c)),"none"===d?this.$el.children("a").hide():this.$el.children("a").show(),"none"===c?this.$el.children("ol").hide():this.$el.children("ol").show()}},{key:"updateSliderCtrlStyle",value:function(t){this.$el.find("a").removeClass(S),0!==t||this.opts.loop?t!==this.totalSlide-1||this.opts.loop||this.$el.find(".".concat(y)).addClass(S):this.$el.find(".".concat(g)).addClass(S)}},{key:"udpateActiveSlideStyle",value:function(){var t=this.opts.curr;this.$slider.children(".".concat(f,".active")).removeClass("active"),this.$slider.children().eq(t).addClass("active"),this.$el.find("li.active").removeClass("active"),this.$el.find("ol").find('li[data-goto-slide="'.concat(t%this.totalSlide,'"]')).addClass("active"),this.updateSliderCtrlStyle(t)}}])&&d(e.prototype,i),n&&d(e,n),t}();function x(t){c=t,t.fn.pageflySlider=function(e){for(var i=arguments.length,n=new Array(i>1?i-1:0),s=1;s<i;s++)n[s-1]=arguments[s];return this.each(function(i,s){var r=t(s).data("pf-slider-x");if(console.log("aaaa ---\x3e instance",r),r){var a;if("string"==typeof e)(a=r)[e].apply(a,n)}else{if("string"==typeof e)throw new Error("This element was not initialized as a Slider yet");r=new b(s,e),t(s).attr("data-slider-x-init","init-ed"),t(s).data("pf-slider-x",r),t(s).data("pf-slider-initialized",!0)}})}}b.constructor.MIN_DRAG_DISTANCE=5,b.defaultOptions={curr:0,slidesToShow:1,slidesToScroll:1,gutter:15,autoPlay:!0,autoPlayDelay:3e3,duration:450,loop:!0,draggable:!0,paginationStyle:"pagination-style-1",navStyle:"nav-style-1",adaptiveHeight:!1,height:400},b.styleOptions={paginations:["pagination-style-1","pagination-style-2","pagination-style-3","none"],navs:["nav-style-1","nav-style-2","nav-style-3","nav-style-4","nav-style-5","none"]},"undefined"!=typeof jQuery&&x(jQuery);e.default=x}])});