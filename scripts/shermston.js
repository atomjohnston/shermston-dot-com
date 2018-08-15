"use strict";

var cache = {
    mediaState: $('#media-state'),
    mainContent: $('.main-content'),
    separators: $('.separator-image'),
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
    cache.separators.css('height', Math.floor(((window.innerWidth / window.innerHeight) * 100) + 1).toString() + '%');
}

var getHandler = function (ms) {
    switch (ms) {
        case 'xs':
        case 'sm': return onSmall;
        case 'lg':
        case 'xl': return compose(onLarge, onMedium);
        default:   return onMedium;
    }
}

var resizeFn = compose(getHandler(getMediaState()), scaleSkyline);

$('.nav-link').on('click', function (e) {
    var target = $(e.target).attr('scroll-to');
    $('.navbar-toggler').click();
    if (!target)
        return;
    window.scrollTo(0, $(target).offset().top - (window.innerHeight / 3));
});

resizeFn();

//$(window).resize(resizeFn);