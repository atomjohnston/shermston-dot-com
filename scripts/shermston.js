"use strict";

var cache = {
    mediaState: $('#media-state'),
    mainContent: $('.main-content'),
    skyline: $('#skyline'),
}

var compose2 = function (f, g) {
    return function (x) {
        return f(g(x));
    }
}

var getMediaState = function () {
    return cache.mediaState.css('--state');
}

var onSmall = function () {
    cache.mainContent.addClass('col');
    cache.mainContent.removeClass('col-10');
}

var onMedium = function () {
    cache.mainContent.addClass('col-10');
    cache.mainContent.removeClass('col');
}

var onLarge = function () { }

var scaleSkyline = function () {
    cache.skyline.css('height', Math.floor((window.innerWidth / window.innerHeight) * 100).toString() + '%');
}

var getHandler = function (ms) {
    switch (ms) {
        case 'xs':
        case 'sm': return onSmall;
        case 'lg':
        case 'xl': return compose2(onLarge, onMedium);
        default:   return onMedium;
    }
}

var resizeFn = function () {
    compose2(getHandler(getMediaState()), scaleSkyline)();
}

resizeFn();

//$(window).resize(resizeFn);