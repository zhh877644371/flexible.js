(function flexible(win, doc) {
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var metaElAttr;
    var dpr = 0,
        scale = 0,
        tid;
    
    // 判断是否存在meta标签
    if(metaEl) {
        // 根据已有的meta标签来设置缩放比例
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/ig);
        if(match) {
            scale = parseFloat(match[1]);
            dpr = parseFloat(1 / scale).to(2);
        }
    }

    // 针对iphone做dpr适配
    if(!dpr && !scale) {
        var isIphone = win.navigator.appVersion.match(/iphone/ig);
        var devicePixelRatio = win.devicePixelRatio;
        if(isIphone) {
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >=2)) {
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    // 设置viewport的属性
    metaElAttr = `initial-scale=${scale}; maximum-scale=${scale}; minimum-scale=${scale}; user-scalable=no`;
    // 是否存在meta标签，如果存在，则设置content，如果不存在，新建meta标签
    if(metaEl) {
        metaEl.setAttribute('content', metaElAttr);
    } else {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', metaElAttr);
        if(docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    function refreshRem() {
        var width = docEl.getBoundingClientRect().width;
        if(width / dpr > 540) {
            width = 540 * dpr;
        }
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
    }
    refreshRem();

    win.addEventListener('resize', function() {
        clearTimeout(tid); // 防止执行两次
        tid = setTimeout(refreshRem, 300);
    }, false);

    win.addEventListener('pageshow', function(e) {
        if(e.persisted) { // 浏览器后退时重新计算
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    // 当页面加载完成时，设置body的font-size
    if(doc.readyState == 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(){
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false)
    }
})(window, document);