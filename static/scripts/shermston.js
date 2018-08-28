"use strict";

var CACHE = {
    _inner: { },
    navs: $('.navbar-nav > li > a'),
    mediaState: $('#media-state'),
    separators: $('.separator-image, .scale'),
    collapsible: $('.navbar-collapse'),
    get: function (query) {
        if (!(query in this._inner))
            this._inner[query] = $(query);
        return this._inner[query];
    }
}

var SIZE = Object.freeze({xs: 0, sm: 1, md: 2, lg: 3, xl: 4});

var compose = function () {
    var fnClosure = arguments;
    return function (x) {
        var stack = [x];
        for (var i = fnClosure.length - 1; i >= 0; i--) {
            stack.push(fnClosure[i](stack.pop()));
        }
        return stack.pop();
    }
}

var partial = function () {
    var aargs = Array.from(arguments);
    return function(bargs) {
        var fn = aargs.shift();
        for (var i = 0; bargs && i < bargs.length; i++) {
            aargs.push(bargs[i]);
        }
        return fn.apply(null, aargs);
    }
}

var getMediaState = function () {
    return CACHE.mediaState.css('--state');
}

var getScreensize = function () {
    return SIZE[getMediaState()];
}

var scaleSeparators = function () {
    CACHE.separators.css('height', Math.floor(((window.innerWidth / window.innerHeight) * 100) + 1).toString() + '%');
}

var getHandler = function (ms) {
    if (ms === 'sm' || ms === 'xs')
        return scaleSeparators;
    return function () { };
}

var largerScroll = function (ref) {
    var div = CACHE.get(ref)[0];
    if (!div)
        return true;
    div.scrollIntoView(false);
    return false;
}

var smallerScroll = function (ref) {
    window.scrollTo(0, CACHE.get(ref).offset().top - (window.innerHeight / 3));
    return false;
}

var navigate = function (size, href) {
    if (!href || href.length <= 1 || href[0] !== '#')
        return true; // propagate click
    return size < SIZE.md
        ? smallerScroll(href)
        : largerScroll(href);
}

var resizeFn = getHandler(getMediaState());

CACHE.navs.on('click', function(e) {
    CACHE.collapsible.collapse('hide');
    return navigate(getScreensize(), e.target.getAttribute('href'));
});

resizeFn();

//$(window).resize(resizeFn);