"use strict";

var cache = {
    mediaState: $('#media-state'),
    separators: $('.separator-image, .scale')
}

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

var resizeFn = getHandler(getMediaState());

resizeFn();

//$(window).resize(resizeFn);