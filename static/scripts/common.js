"use strict";

URL = 'https://shermston.com';

const curry = (fn) => {
    const arity = fn.length;
    return function $curry(...args) {
        return args.length < arity
            ? $curry.bind(null, ...args)
            : fn.call(null, ...args);
    };
};

const doHttp = (url, verb, contentType, auth, method, payload) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(verb, url + method);
        if (contentType)
            xhr.setRequestHeader('Content-Type', contentType)
        if (auth)
            xhr.setRequestHeader(auth.name, header.value);
        xhr.onload = () => xhr.status === 200
            ? resolve(xhr.responseText)
            : reject(xhr.status);
        xhr.send(payload ? JSON.stringify(payload) : undefined);
    });
}

const httpGet = curry(doHttp)(URL, 'GET', undefined);
const httpPost = curry(doHttp)(URL, 'POST', 'application/json');

const toBasic = (name, passwd) => 'Basic ' + window.btoa(name + ':' + passwd);
const toHeader = (name, value) => new { name: name, value: value };
const basicAuth = (usr, passwd) => toHeader('Authorization', toBasic(usr, passwd));
const sessionAuth = () => toHeader('Session-Id', sessionStorage.getItem('shermstonSession'));