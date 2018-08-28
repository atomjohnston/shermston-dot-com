"use strict";

var displayUpdate = function () {
    $('#update').removeClass('d-none');
    $('#start').addClass('d-none');
}

var displayStart = function () {
    $('#update').addClass('d-none');
    $('#start').removeClass('d-none');
}

var getResponseAction = function (req) {
    switch (req.status) {
        case 200: return displayUpdate;
        default: throw 'unknown response ' + statusCode;
    }
}

$('#submit-code').on('click', function() {
    displayUpdate();
    // var xhr = new XMLHttpRequest();
    // xhr.open('GET', 'guest-count');
    // xhr.setRequestHeader('Authorization', 'Basic: ' + window.btoa($('#surname').text() + ':' + $('#secret').text()));
    // xhr.onload = function() {
    //     var action = getResponseAction(xhr);
    //     action();
    // }
    // xhr.send();
});

$('#update-guests').on('click', function () {
    displayStart();
});
