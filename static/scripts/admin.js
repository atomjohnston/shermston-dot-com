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
  
const toBasic = (name, passwd) => 'Basic ' + window.btoa(name + ':' + passwd);
const toHeader = (name, value) => new { name: name, value: value };
const basicAuth = (usr, passwd) => toHeader('Authorization', toBasic(usr, passwd));
const sessionAuth = () => toHeader('Session-Id', sessionStorage.getItem('shermstonSession'));

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

const formatRsvpTable = (response) => {
    response.sort((a, b) => b.attending - a.attending);
    let formatNames = (guests) => guests.map((guest) => guest.names.reduce((p, c) => `${c} ${guest.surname}`));
    let formatRow = (response) => {
        return `<tr id="${response.guests[0].invite}" surname="${response.guests[0].surname}">
            <td class="attending">${response.attending}</td>
            <td><button type="submit" class="updater d-none">change</button></td>
            <td>${formatNames(response.guests).join(', ')}</td>
            <td>${response.guests[0].invite}</td>
          </tr>`
    };
    let table =  response.reduce((prev, curr) => {
        return {
            attending: prev.attending + curr.attending,
            table: prev.table + formatRow(curr)
        };
    });
    return {
        total: table.attending,
        table: `<table class="table">
                 <thead>
                   <th scope="col">#</th>
                   <th scope="col"></th>
                   <th scope="col">names</th>
                   <th scope="col">invite</th>
                 </thead>
                 <tbody>${table.table}</tbody>
               </table>`
    };
}

const displayRsvps = (response) => {
    let result = formatRsvpTable(response);
    $('#admin-logon').addClass('d-none');
    $('#rsvp-table').removeClass('d-none');
    $('#ref-but').removeClass('d-none');
    $('#rsvp-table').html(result.table);
    $('#header').text('ATTENDING: ' + result.total);
    $('#rsvp-table .attending').css('cursor', 'pointer');
    $('#rsvp-table .attending').on('click', editRsvp);
}

const editRsvp = (e) => {
    let countBtn = $(e.target); 
    let row = countBtn.closest('tr');
    let updateBtn = row.find('.updater');
    if (!updateBtn.hasClass('d-none'))
        return;
    updateBtn.removeClass('d-none');
    countBtn.html('<input type="text" value="' + countBtn.text() + '"></input>');
    let callback = async (invite, surname) => {
        let count = parseInt(countBtn.find('input').val());
        countBtn.html(count);
        updateBtn.addClass('d-none');
        let body = await httpPost(sessionAuth(), '/make-it-so', { invite: invite, name: surname, count: count });
        displayRsvps(JSON.parse(body).responses);
    };
    updateBtn.on('click', curry(callback)(row.attr('id'), row.attr('surname')));
}

$('#get-rsvps').on('click', async () => {
    let body = await httpGet(basicAuth($('#surname').val(), $('#secret').val()), '/tout-les-s-il-vous-plait');
    let response = JSON.parse(body);
    sessionStorage.setItem('shermstonSession', response.session_id);
    displayRsvps(response.responses);
});