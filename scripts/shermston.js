"use strict";

var cache = {
    mediaState: $('#media-state'),
    //mainContent: $('.main-content'),
    separators: $('.separator-image, .scale'),
}

//var states = Object.freeze(['xs', 'sm', 'md', 'lg', 'xl']);

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

// var adjustContentWidth = function (targetState) {
//     var targetWidth = getWidth(targetState);
//     if (cache.mainContent.hasClass(targetWidth))
//         return;
//     var removeUs = states.filter(function (st) { return st !== targetState }).map(function (st) { return getWidth(st); });
//     for (var i = 0; i < removeUs.length; i++) {
//         cache.mainContent.removeClass(removeUs[i]);
//     }
//     cache.mainContent.addClass(targetWidth);
// }

var scaleSeparators = function () {
    cache.separators.css('height', Math.floor(((window.innerWidth / window.innerHeight) * 100) + 1).toString() + '%');
}

var getHandler = function (ms) {
    if (ms === 'sm' || ms === 'xs')
        return scaleSeparators;
    return function () { };
    // switch (ms) {
    //     case 'xs':
    //     case 'sm': return compose(partial(adjustContentWidth, 'sm'), scaleSeparators);
    //     case 'md': return partial(adjustContentWidth, 'md');
    //     case 'lg':
    //     case 'xl': return partial(adjustContentWidth, 'lg');
    // }
}

// var getWidth = function (ms) {
//     switch (ms) {
//         case 'xs':
//         case 'sm': return 'col';
//         case 'md': return 'col-10'
//         case 'lg':
//         case 'xl': return 'col-7';
//     }
// }

var resizeFn = getHandler(getMediaState());

$('.nav-link').on('click', function (e) {
    var target = $(e.target).attr('scroll-to');
    $('.navbar-toggler').click();
    if (!target)
        return;
    window.scrollTo(0, $(target).offset().top - (window.innerHeight / 3));
});

resizeFn();

//$(window).resize(resizeFn);