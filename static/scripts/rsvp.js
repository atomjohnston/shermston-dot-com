"use strict";

import { httpGet, httpPost, basicAuth, sessionAuth } from './common';


const displayUpdate = (response) => {
    $('#update').removeClass('d-none');
    $('#start').addClass('d-none');
    let guests = $('#guests');
    guests.parent().find('label').text(response.surname + ' Guests:');
    let menu = '';
    for (let i = 0; i <= response.invite_count; i++) {
        menu += i == response.guest_count 
            ? `<option value="${i}" selected="selected">${i}</option>`
            : `<option value="${i}">${i}</option>`;
    }
    guests.html(menu);
}

const displayRsvp = (response) => {
    $('#update').addClass('d-none');
    $('#start').addClass('d-none');
    $('#rsvp-count').html(response.guest_count);
    $('#thank-you').removeClass('d-none');
}

const displayError = (errorMessage) => {
    $('#update').addClass('d-none');
    $('#start').addClass('d-none');
    $('#thank-you').addClass('d-none');
    $('#oops .message').html(errorMessage);
    $('#oops').removeClass('d-none');
}

const getErrorMessage = (status) => {
    switch(status) {
        case 401:
            return 'Seems like your invite code may have been mis-typed (it\'s case-sensitive). You can <a href="javascript:location.reload()">try again</a>?';
        case 403:
            return 'Did you misspell your last name? You can <a href="javascript:location.reload()">try again</a>.';
        default:
            return 'Something went really wrong, please <a href="javascript:location.reload()">try again</a>.';
    }
}

$('#submit-code').on('click', async () => {
    try {
        let responseText = await httpGet(basicAuth($('#surname').val(), $('#secret').val()), '/guest-count');
        let response = JSON.parse(responseText)
        sessionStorage.setItem('shermstonSession', response.session_id);
        displayUpdate(response);
    }
    catch (status) {
        displayError(getErrorMessage(status));
    }
});

$('#update-guests').on('click', async () => {
    try {
        let responseText = await httpPost(sessionAuth(), '/guest-count', { count: parseInt($('#guests').val()) })
        displayRsvp(JSON.parse(responseText));
    }
    catch (status) {
        throw 'unknown response ' + xhr.status;
    }
});
