/*
 * FallUI  1.0.0
 *
 * 保证此JS在页面上最后一个加载 
 * email: eighteencold@163.com
 * Date: 2013-12-05
 */
(function() {
	var _FallUI = window.FallUI;
	//ie下通过getAttribute('src', 4)才能获取全路径
	var scripts = document.getElementsByTagName('script'), script = scripts[scripts.length - 1], jspath = script.hasAttribute ? script.src : script.getAttribute('src', 4);

	var z = {
		version : '1.0.0',
		script:script,
		JSLIBPATH : jspath.substr(0, jspath.lastIndexOf('/') + 1),
		Config : {
			namespace : 'window',
			context : 'backend',
			debug : 'no',
			skin : 'Base'
		}
	};

	//防止重复加载
	if (_FallUI && _FallUI.version === z.version && _FallUI.JSLIBPATH === z.JSLIBPATH) {
		return;
	} else {
		window.FallUI = z;
	}

	var uri2varName = '_' + document.URL.split("#")[0].split("=")[0].replace(location.protocol + '//' + location.host, '').replace(/[^A-Za-z0-9\/]/g, '').replace(/\//g, '_');

	z.startTime = +new Date();
	z.CONTEXTPATH = z.JSLIBPATH.replace(/\/[^\/]+\/?$/, '/');
	z.pageId = uri2varName;
	
	/**浏览器相关*/
	z.navigator = {};
	
	/**浏览器判断**/
	var ua = navigator.userAgent.toLowerCase();
	z.navigator.isQuirks = document.compatMode === 'BackCompat';
	z.navigator.isStrict = document.compatMode === 'CSS1Compat';
	z.navigator.isWindows = /windows|win32/.test(ua);
	z.navigator.isMac = /macintosh|mac os/.test(ua);
	z.navigator.isLinux = /linux/.test(ua);
	z.navigator.isWebKit = /webkit/.test(ua);
	z.navigator.isChrome = /chrome/.test(ua);
	z.navigator.isSafari = /safari/.test(ua) && !z.isChrome;
	//包括firefox
	z.navigator.isGecko = /gecko/.test(ua);
	z.navigator.isFirefox = /firefox/.test(ua);
	z.navigator.isOpera = /opera/.test(ua) && !!window.opera;
	z.navigator.isIE = /msie/.test(ua) && !z.isOpera;
	z.navigator.ieVersion = z.isIE ? parseFloat(/msie ([\w.]+)/.exec(ua)[1]) : null;
	z.navigator.isIE9 = /msie (7|8|9)/.test(ua) && !!window.performance;
	if (z.navigator.isIE9) {
		z.navigator.ieVersion = 9;
	}
	//在ie兼容模式下ua会返回msie 7
	z.navigator.isIE8 = /msie (7|8)/.test(ua) && !!window.XDomainRequest;
	if (z.navigator.isIE8) {
		z.navigator.ieVersion = 8;
	}
	z.navigator.isIE7 = /msie 7/.test(ua) && !window.XDomainRequest;
	z.navigator.isIE6 = z.isIE && !window.XMLHttpRequest;
	z.navigator.isMobile = ('createTouch' in document) && !('onmousemove' in document.documentElement) || /(iphone|ipad|ipod|android)/.test(ua);
	z.navigator.isBorderBox = z.isIE && z.isQuirks;
	if (z.navigator.isIE) {
		// IE默认情况下不缓存背景图片，所以当鼠标在有CSS背景的按钮或是图片上移动时，图片会闪烁甚至鼠标会出现忙的状态
		try {
			document.execCommand("BackgroundImageCache", false, true);
		} catch (e) {
		}
	}

	//对父窗口的访问是否受限
	z.restricted = false;
	
	/**
	 *获取最底层窗口
	 */
	z.getRootWin = function() {
		var pw = window;
		while (pw != pw.parent) {
			try {
				//在没权限访问parent中的对象时会出错
				var pd = pw.parent.document;
				var all = pd.getElementsByTagName('*');
			} catch (ex) {
				z.restricted = true;
				return pw;
			}
			if ( typeof pw.parent.Webui != 'object') {
				return pw;
			}
			pw = pw.parent;
		}
		return pw;
	};
	z.rootWin = z.getRootWin();
	z.rootDoc = z.rootWin.document;

	/**
	 * 异步加载脚本
	 * url:js文件路径，相对于引用js框架的页面，如果要从js框架根目录开始引用需自行加上z.JSLIBPATH
	 * onsuccess:js文件加载后的回调函数
	 */
	z.loadJS = z.loadJs = function(url, onsuccess) {
		var head = document.getElementsByTagName('head')[0] || document.documentElement, script = document.createElement('script'), done = false;
		script.src = url;

		script.onerror = script.onload = script.onreadystatechange = function() {
			if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
				done = true;
				if (onsuccess) {
					onsuccess();
				}
				script.onerror = script.onload = script.onreadystatechange = null;
				head.removeChild(script);
			}
		};
		head.appendChild(script);
	};

	/**
	 * 加载脚本
	 * url:js文件路径，因有加z.JSLIBPATH，所以路径是相对于js框架根目录开始
	 */
	z.importJS = z.importJs = function(url) {
		if (!/^\/|^\w+\:\/\//.test(url)) {
			url = z.JSLIBPATH + url;
		}
		if (!document.body || document.readyState == 'loading') {
			document.write('<script type="text/javascript" src="' + url + '"><\/script>');
		} else {
			z.loadJS(url);
		}

	};

	/**
	 * 异步加载CSS文件
	 * url:css文件路径，相对于引用js框架的页面，如果要从js框架根目录开始引用需自行加上z.JSLIBPATH
	 */
	z.loadCSS = z.loadCss = function(url) {
		var head = document.getElementsByTagName('head')[0] || document.documentElement;
		if (z.navigator.isIE) {
			document.createStyleSheet(url);
		} else {
			var e = document.createElement('link');
			e.rel = 'stylesheet';
			e.type = 'text/css';
			e.href = url;
			head.appendChild(e);
		}
	};

	/**
	 * 加载CSS文件
	 * url:css文件路径，因有加z.JSLIBPATH，所以路径是相对于js框架根目录开始
	 */
	z.importCSS = z.importCss = function(url) {
		if (!/^\/|^\w+\:\/\//.test(url)) {
			url = z.JSLIBPATH + url;
		}
		if (!document.body || document.readyState == 'loading') {
			document.write('<link rel="stylesheet" type="text/css" href="' + url + '" />');
		} else {
			z.loadCSS(url);
		}
	};

	/**
	 * 添加向页面内添加一个style标签，并添加规则
	 * @param styleElId
	 * @param cssStr
	 */
	z.addStyle = function(styleElId, cssStr) {
		if (!cssStr) {
			cssStr = styleElId;
			styleElId = 'style' + (1 + z.startTime);
		}
		/* 如果是一个不含{}的字符串，则认为是要载入外部的css */
		if (cssStr.indexOf('{') < 1 && cssStr.indexOf('}') < 1 && /^\S$/.test(cssStr)) {
			return z.loadCSS(cssStr);
		}
		var styleEl = document.getElementById(styleElId);
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.type = 'text/css';
			styleEl.id = styleElId;
			document.getElementsByTagName('head')[0].appendChild(styleEl);
		}
		if (styleEl.styleSheet) {
			styleEl.styleSheet.cssText += cssStr;
		} else {
			cssStr = document.createTextNode(cssStr);
			styleEl.appendChild(cssStr);
		}
		return styleEl;
	};
	
	z.importJS("JQuery/jquery-1.11.1.js");
	z.importJS("Bootstrap/js/bootstrap.js");
	z.importJS("Validate.js");
	z.importCSS("Bootstrap/css/bootstrap.css");
	//z.importCSS("Bootstrap/css/bootstrap-theme.css");
})();
