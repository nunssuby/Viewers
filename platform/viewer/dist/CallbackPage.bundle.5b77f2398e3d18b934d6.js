(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{1148:function(e,t,r){"use strict";r.r(t);var n=r(0),o=r.n(n),i=r(82),a=r(1),u=r.n(a),c=r(93);function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function p(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function s(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function l(e,t){return!t||"object"!==f(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function b(e){return(b=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function y(e,t){return(y=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var h,m,w,d=function(e){function t(){return p(this,t),l(this,b(t).apply(this,arguments))}var r,n,i;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&y(e,t)}(t,e),r=t,(n=[{key:"render",value:function(){var e=this;return o.a.createElement(c.CallbackComponent,{userManager:this.props.userManager,successCallback:function(){var t=JSON.parse(sessionStorage.getItem("ohif-redirect-to")),r=t.pathname,n=t.search,o=void 0===n?"":n;e.props.history.push({pathname:r,search:o})},errorCallback:function(e){throw new Error(e)}},o.a.createElement("div",null,"Redirecting..."))}}])&&s(r.prototype,n),i&&s(r,i),t}(n.Component);h=d,m="propTypes",w={userManager:u.a.object.isRequired,history:u.a.object.isRequired},m in h?Object.defineProperty(h,m,{value:w,enumerable:!0,configurable:!0,writable:!0}):h[m]=w,t.default=Object(i.g)(d)}}]);
//# sourceMappingURL=CallbackPage.bundle.5b77f2398e3d18b934d6.js.map