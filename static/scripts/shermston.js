"use strict";

const CACHE = {
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

const SIZE = Object.freeze({xs: 0, sm: 1, md: 2, lg: 3, xl: 4});

const getMediaState = () => CACHE.mediaState.css('--state');

const getScreensize = () => SIZE[getMediaState()];

const scaleSeparators = () => CACHE.separators.css('height', Math.floor(((window.innerWidth / window.innerHeight) * 100) + 1).toString() + '%');

const getHandler = (ms) => (ms === 'sm' || ms === 'xs') ? scaleSeparators : () => { };

const largerScroll = (ref) => {
    let div = CACHE.get(ref)[0];
    if (!div)
        return true;
    div.scrollIntoView(false);
    return false;
}

const smallerScroll = (ref) => {
    window.scrollTo(0, CACHE.get(ref).offset().top - (window.innerHeight / 3));
    return false;
}

const navigate = (size, href) => {
    if (!href || href.length <= 1 || href[0] !== '#')
        return true; // propagate click
    return size < SIZE.md
        ? smallerScroll(href)
        : largerScroll(href);
}

const resizeFn = getHandler(getMediaState());

CACHE.navs.on('click', (e) => {
    CACHE.collapsible.collapse('hide');
    return navigate(getScreensize(), e.target.getAttribute('href'));
});

resizeFn();

//$(window).resize(resizeFn);