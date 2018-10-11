"use strict";

URL = 'https://shermston.com';


function toBasic (name, passwd) {
    return 'Basic ' + window.btoa(name + ':' + passwd);
}

function toHeader(name, value) {
    return { name: name, value: value };
}

function formatRsvpTable(response) {
    var table = ''
    response.sort(function (a, b) { return b.attending - a.attending; });
    var formatNames = function (guests) {
      var names = [];
      for (var i = 0; i < guests.length; i++) {
        for (var n = 0; n < guests[i].names.length; n++) {
          names.push(guests[i].names[n] + ' ' + guests[i].surname);
        }
      }
      return names.join(', ');
    }
    var total = 0;
    for (var i = 0; i < response.length; i++) {
        total += response[i].attending;
        var row = 
          '<tr id="' + response[i].guests[0].invite + '" surname="' + response[i].guests[0].surname + '">' + 
            '<td class="attending">{}</td>'.replace('{}', response[i].attending) +
            '<td><button type="submit" class="updater d-none">change</button></td>' +
            '<td>{}</td>'.replace('{}', formatNames(response[i].guests)) +
            '<td>{}</td>'.replace('{}', response[i].guests[0].invite) +
          '</tr>';
        table += row;
    }
    return {
        total: total,
        table: '<table class="table">' +
                 '<thead>' +
                   '<th scope="col">#</th>' +
                   '<th scope="col"></th>' +
                   '<th scope="col">names</th>' +
                   '<th scope="col">invite</th>' +
                 '</thead>' +
                 '<tbody>' +
                   table +
                 '</tbody>' +
               '</table>'
    };
}

function displayRsvps(response) {
    var result = formatRsvpTable(response);
    $('#rsvp-table').html(result.table);
    $('#header').text('ATTENDING: ' + result.total);
    $('#admin-logon').addClass('d-none');
    $('#rsvp-table').removeClass('d-none');
    $('#rsvp-table .attending').css('cursor', 'pointer');
    $('#rsvp-table .attending').on('click', editRsvp);
    $('#ref-but').removeClass('d-none');
}

function editRsvp(e) {
    var countBtn = $(e.target); 
    var row = countBtn.closest('tr');
    var updateBtn = row.find('.updater');
    if (!updateBtn.hasClass('d-none'))
        return;
    updateBtn.removeClass('d-none');
    var callback = (function(invite, surname) {
        return function() {
            var count = parseInt(countBtn.find('input').val());
            var headers = [
                toHeader('Session-Id', sessionStorage.getItem('shermstonSession')),
                toHeader('Content-Type', 'application/json')
            ];
            var redisplay = function(sCode, body) {
                if (sCode != 200)
                    throw 'unknown response ' + sCode
                displayRsvps(JSON.parse(body).responses);
            }
            updateBtn.addClass('d-none');
            countBtn.html(count);
            sendRequest('POST', URL + '/make-it-so',
                JSON.stringify({ invite: invite, name: surname, count: count }),
                headers, redisplay);
        }
    })(row.attr('id'), row.attr('surname'));
    updateBtn.on('click', callback);
    countBtn.html('<input type="text" value="' + countBtn.text() + '"></input>');
}

function sendRequest(verb, url, payload, headers, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(verb, url);
    headers = headers || [];
    for (var i = 0; i < headers.length; i++) {
        xhr.setRequestHeader(headers[i].name, headers[i].value);
    }
    xhr.onload = function() {
        callback(xhr.status, xhr.responseText);
    }
    xhr.send(payload);
}

$('#get-rsvps').on('click', function() {
    var callback = function(sCode, body) {
        if (sCode != 200)
            throw 'oh noes!'
        var response = JSON.parse(body)
        sessionStorage.setItem('shermstonSession', response.session_id);
        displayRsvps(response.responses);
    }
    var headers = [toHeader('Authorization', toBasic($('#surname').val(), $('#secret').val()))];
    sendRequest('GET', URL + '/tout-les-s-il-vous-plait', undefined, headers, callback);
});
