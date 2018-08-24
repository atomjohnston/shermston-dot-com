"use strict";

var cache = {
    mediaState: $('#media-state'),
    separators: $('.separator-image, .scale'),
    navs: $('.navbar-nav > li > a'),
    collapsible: $('.navbar-collapse'),
}

var sizeEnum = Object.freeze({'xs': 0, 'sm': 1, 'md': 2, 'lg': 3, 'xl': 4});

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
    return cache.mediaState.css('--state');
}

var scaleSeparators = function () {
    cache.separators.css('height', Math.floor(((window.innerWidth / window.innerHeight) * 100) + 1).toString() + '%');
}

var getHandler = function (ms) {
    if (ms === 'sm' || ms === 'xs')
        return scaleSeparators;
    return function () { };
}

var specialScroll = function (ref) {
    var div = document.getElementById(ref.substring(1, ref.indexOf('-')));
    if (!div)
        return;
    div.scrollIntoView(false);
}

var resizeFn = getHandler(getMediaState());

cache.navs.on('click', function(e) {
    cache.collapsible.collapse('hide');
    if (sizeEnum.md <= sizeEnum[getMediaState()]) {
        specialScroll(e.target.getAttribute('href'));
        return false;
    }
});

resizeFn();

$(window).resize(resizeFn);