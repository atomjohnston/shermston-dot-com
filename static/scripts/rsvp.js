"use strict";

URL = 'http://127.0.0.1:5000/guest-count';

var displayUpdate = function (response) {
    $('#update').removeClass('d-none');
    $('#start').addClass('d-none');
    var guests = $('#guests');
    guests.parent().find('label').text(response.surname + ' Guests:');
    var menu = '';
    for (var i = 0; i <= response.invite_count; i++) {
        menu += i == response.guest_count 
            ? '<option value="_" selected="selected">_</option>'.replace(/_/g, i)
            : '<option value="_">_</option>'.replace(/_/g, i);
    }
    guests.html(menu);
}

var displayRsvp = function (response) {
    $('#update').addClass('d-none');
    $('#start').addClass('d-none');
    $('#rsvp-count').html(response.guest_count);
    $('#thank-you').removeClass('d-none');
}

var displayStart = function () {
    $('#update').addClass('d-none');
    $('#start').removeClass('d-none');
}

$('#submit-code').on('click', function() {
    var auth = window.btoa($('#surname').val() + ':' + $('#secret').val());
    var xhr = new XMLHttpRequest();
    xhr.open('GET', URL);
    xhr.setRequestHeader('Authorization', 'Basic: ' + auth);
    xhr.onload = function() {
        if (xhr.status != 200)
            throw 'unknown response ' + xhr.status
        var response = JSON.parse(xhr.responseText)
        sessionStorage.setItem('shermstonSession', response.session_id);
        displayUpdate(response);
    }
    xhr.send();
});

$('#update-guests').on('click', function () {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', URL);
    xhr.setRequestHeader('Session-Id', sessionStorage.getItem('shermstonSession'));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status != 200)
            throw 'unknown response ' + xhr.status
        displayRsvp(JSON.parse(xhr.responseText));
    }
    xhr.send(JSON.stringify({count: parseInt($('#guests').val())}));
});