/*globals commas:true humanTimeFromSeconds:true secondsFromHumanTime:true*/
function sortTable() {
  $('table').find('td').filter(function() {
    return $(this).index() === 4;
  }).sortElements(function(a, b) {
    a = parseInt($.text([a]).replace(',', ''), 10);
    b = parseInt($.text([b]).replace(',', ''), 10);

    return a > b ? -1 : 1;
  }, function() {
    return this.parentNode;
  });
}

function updateSelected() {
  var state = $.bbq.getState();

  $('a.time').removeClass('selected');

  if (state.appSince) {
    $('a[data-parameter=app][data-time=' + humanTimeFromSeconds(state.appSince) + ']').addClass('selected');
  } else {
    $('a[data-parameter=app][data-time=forever]').addClass('selected');
  }

  if (state.accountSince) {
    $('a[data-parameter=account][data-time=' + humanTimeFromSeconds(state.accountSince) + ']').addClass('selected');
  } else {
    $('a[data-parameter=account][data-time=forever]').addClass('selected');
  }
}

function refresh() {
  updateSelected();

  var options = {};

  var state = $.bbq.getState();

  if (state.appSince) {
    options.appSince = moment().subtract('seconds', parseInt(state.appSince, 10)).unix();
  }

  if (state.accountSince) {
    options.accountSince = moment().subtract('seconds', parseInt(state.accountSince, 10)).unix();
  }

  $.getJSON('/apps/accounts', options, function(appsAccounts) {
    $('#rows').html('');

    appsAccounts.forEach(function(app) {
      if (!app.details || !app.details.notes) {
        app.details = {
          notes: {
            appName: '',
            appUrl: ''
          }
        };
      } else {
        app.details.notes.appUrl = '<a href="' + app.details.notes.appUrl + '">' + app.details.notes.appUrl + '</a>';
      }

      var email = '';

      if (app.details.profile && app.details.profile.data && app.details.profile.data.email) {
        email = '<a href="mailto:'+ app.details.profile.data.email + '">' + app.details.profile.data.email + '</a>';
      }

      if (app === 'total') {
        return;
      }

      if (!app.created) {
        app.created = '';
      } else {
        app.created = moment(app.created).format("M/D/YYYY h:mma");
      }

      var ratio = Math.round((app.profiles / app.accounts) * 100) / 100;

      $('#rows').append('<tr>' +
          '<td><a href="/app/info/' + app.id + '">' + app.id + '</a></td>' +
          '<td>' + app.details.notes.appName  + '</td>' +
          '<td>' + app.details.notes.appUrl  + '</td>' +
          '<td>' + commas(app.accounts) + '</td>' +
          '<td>' + commas(app.profiles) + '</td>' +
          '<td>' + ratio + '</td>' +
          '<td>' + app.created + '</td>' +
        '</tr>');
    });
    $('#total > span').text(appsAccounts.length);
    sortTable();
  });
}

$(function() {
  $('a.time').click(function(e) {
    e.preventDefault();

    var $e = $(this);

    var type = $e.attr('data-parameter') + 'Since';

    var humanTime = $e.attr('data-time');

    if (humanTime === 'forever') {
      $.bbq.removeState(type);

      return;
    }

    var seconds = secondsFromHumanTime(humanTime);

    var state = {};

    state[type] = seconds;

    $.bbq.pushState(state);
  });

  refresh();

  $(window).bind('hashchange', function() {
    refresh();
  });

  $('#refresh').click(function() {
    refresh();
  });
});
