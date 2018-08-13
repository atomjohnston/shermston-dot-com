var cache = {
    mediaState: $('#media-state'),
    brassTax: $('#brass-tacks'),
    spacer: $('.parallax .md-plus:first()'),
    mainContent: $('#main-content'),
}

var getMediaState = function () {
    return cache.mediaState.css('--state');
}

var hasSmallSummary = function () {
    return $('#not-sm-spacer').length > 0;
}

var onSmall = function () {
    // cache.mainContent.addClass('col');
    // cache.mainContent.removeClass('col-10');
    // cache.brassTax.addClass('col');
    // cache.brassTax.removeClass('col-5');
    // cache.spacer.addClass('col-6');
    // cache.spacer.removeClass('col-5');
}

var onMedium = function () {
    // cache.mainContent.addClass('col-10');
    // cache.mainContent.removeClass('col');
    // cache.brassTax.addClass('col-5');
    // cache.brassTax.removeClass('col');
    // cache.spacer.addClass('col-6');
    // cache.spacer.removeClass('col-5');
}

var onLarge = function () {
    // cache.spacer.addClass('col-5');
    // cache.spacer.removeClass('col-6');
}

var resizeFn = function () {
    (function () { 
        switch (getMediaState()) {
            case 'xs':
            case 'sm': return onSmall;
            case 'lg': return compose2(onLarge, onMedium);
            default:   return onMedium;
        }
    })();
}

var compose2 = function (f, g) {
    return function (x) {
        return f(g(x));
    }
}

resizeFn();

$(window).resize(resizeFn);