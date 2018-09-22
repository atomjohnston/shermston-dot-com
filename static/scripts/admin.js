"use strict";

URL = 'https://shermston.com/tout-les-s-il-vous-plait';

var displayRsvps = function (response) {
    $('#admin-logon').addClass('d-none');
    $('#rsvp-table').removeClass('d-none');
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
    for (var i = 0; i < response.length; i++) {
        var row = 
          '<tr id="{}">'.replace('{}', response[i].guests[0].invite) + 
            '<td class="attending">{}</td>'.replace('{}', response[i].attending) +
            '<td>{}</td>'.replace('{}', formatNames(response[i].guests)) +
            '<td>{}</td>'.replace('{}', response[i].guests[0].invite) +
          '</tr>';
        table += row;
    }
    $('#rsvp-table').html(
      '<table class="table">' +
        '<thead>' +
          '<th scope="col">#</th>' +
          '<th scope="col">names</th>' +
          '<th scope="col">invite</th>' +
        '</thead>' +
        '<tbody>' +
          table +
        '</tbody>' +
      '</table>');
    $('#rsvp-table .attending').css('cursor', 'pointer');
    $('#rsvp-table .attending').on('click', function(e) {
        var invite = $(e.target).closest('tr').attr('id');
        console.log(invite);
    });
}

$('#get-rsvps').on('click', function() {
    var auth = window.btoa($('#surname').val() + ':' + $('#secret').val());
    var xhr = new XMLHttpRequest();
    xhr.open('GET', URL);
    xhr.setRequestHeader('Authorization', 'Basic ' + auth);
    xhr.onload = function() {
        switch(xhr.status) {
            case 200:
                var response = JSON.parse(xhr.responseText)
                displayRsvps(response);
                break;
            default:
                throw 'oh noes!'
                break;
        }
    }
    xhr.send();
});
