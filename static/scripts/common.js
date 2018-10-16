"use strict";

URL = 'https://shermston.com';

export const curry = (fn) => {
    const arity = fn.length;
    return function $curry(...args) {
        return args.length < arity
            ? $curry.bind(null, ...args)
            : fn.call(null, ...args);
    };
};

export const doHttp = (url, verb, contentType, auth, method, payload) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(verb, url + method);
        if (contentType)
            xhr.setRequestHeader('Content-Type', contentType)
        if (auth)
            xhr.setRequestHeader(auth.name, header.value);
        xhr.onload = () => {
            return xhr.status === 200
                ? resolve(xhr.responseText)
                : reject(xhr.status);
        }
        xhr.send(payload ? JSON.stringify(payload) : undefined);
    });
}

export const httpGet = curry(doHttp)(URL, 'GET', undefined);
export const httpPost = curry(doHttp)(URL, 'POST', 'application/json');

export const httpGetJson = async (auth, method, payload) => JSON.parse(await httpGet(auth, method, payload));
export const httpPostJson = async (auth, method, payload) => JSON.parse(await httpPost(auth, method, payload));

export const toBasic = (name, passwd) => 'Basic ' + window.btoa(name + ':' + passwd);
export const toHeader = (name, value) => new { name: name, value: value };
export const basicAuth = (usr, passwd) => toHeader('Authorization', toBasic(usr, passwd));
export const sessionAuth = () => toHeader('Session-Id', sessionStorage.getItem('shermstonSession'));