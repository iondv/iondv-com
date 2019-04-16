"use strict";

$(window).resize(function () {
});

(function () {
  var PAGE_SCROLLING = false;
  var $pages = $('.base').children();
  var wheelTime = 0;
  var wheelDelta = 0;
  var scrolling = false;

  if (PAGE_SCROLLING) {
    $(window).scroll(function(event) {
      var diff = Date.now() - wheelTime;
      if (diff > 200) {
        return true;
      }
      wheelTime = 0;
      var $target = getTargetPage();
      if ($target) {
        scroll($target)
      }
    });

    $(document.body).on('mousewheel', function(event) {
      if (scrolling) {
        return event.preventDefault();
      }
      wheelTime = Date.now();
      wheelDelta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
    });
  }

  $(document.body).on('click', '[data-scroll-to]', function (event) {
    event.preventDefault();
    scroll($($(event.target).data('scrollTo')));
  });

  function scroll ($target) {
    if ($target.length) {
      scrolling = true;
      $('html,body').animate({
        scrollTop: $target.offset().top
      }, function () {
        scrolling = false;
      });
    }
  }

  function getTargetPage () {
    if (wheelDelta < 0) {
      for (var i = 0; i < $pages.length; ++i) {
        var top = $pages.get(i).getClientRects()[0].top;
        if (top >= 40) {
          return $pages.eq(i);
        }
      }
    } else {
      for (var i = $pages.length - 1; i >= 0; --i) {
        var top = $pages.get(i).getClientRects()[0].top;
        if (top < -20) {
          return $pages.eq(i);
        }
      }
    }
  }
})();

/* SIDE PANEL */

(function () {
  $('.side-panel-open').click(function () {
    $('.side-panel').addClass('active');
  });

  $('.side-panel-close').click(function () {
    $('.side-panel').removeClass('active');
  });

  $(document.body).click(function (event) {
    let $target = $(event.target);
    if (!$target.closest('.side-panel').length && !$target.closest('.side-panel-open').length) {
      $('.side-panel-close').click();
    }
  });
})();

/* COOKIE NOTIFY */

(function () {
  const STORE_KEY = 'cookie-agreement-confirmation';
  const $notify = $('.cookie-notify-panel');
  const $agree = $notify.find('[data-agree]');

  $agree.click(function () {
    store.set(STORE_KEY, true);
    $notify.removeClass('open');
  });

  $(document.body).on('click', '[data-cookie-agree]', function () {
    store.set(STORE_KEY, true);
  });

  if (!store.get(STORE_KEY)) {
    $notify.addClass('open');
  }

})();

/* SCROLL */

$(window).scroll(function (event) {
  $(document.body).toggleClass('scrolling', $(window).scrollTop() > 60);
}).scroll();

/* USING_FOR */

$('#page-using-for').each(function () {
  let $container = $(this);
  let $menu = $container.find('.page-menu');

  $menu.children().click(function (event) {
    event.preventDefault();
    let $item = $(this);
    $menu.children().removeClass('active');
    $item.addClass('active');
    $container.attr('data-active', $item.data('id'));
  });

});

/* STUDIO */

$(function () {

  setLanguage();

  var locales = {
    'ru': {
      datepicker: {
        language: 'ru'
      },
      datetimepicker: {
        locale: 'ru',
        format: 'DD.MM.YYYY HH:mm:ss'
      },
      dataTable: {
        "processing": "Подождите...",
        "search": "Поиск:",
        "lengthMenu": "Показать по _MENU_",
        "info": "Записи с _START_ до _END_ из _TOTAL_ записей",
        "infoEmpty": "Записи с 0 до 0 из 0 записей",
        "infoFiltered": "(всего _MAX_)",
        "infoPostFix": "",
        "loadingRecords": "Загрузка записей...",
        "zeroRecords": "Записи отсутствуют.",
        "emptyTable": "В таблице отсутствуют данные",
        "paginate": {
          "first": "<<",
          "previous": "<",
          "next": ">",
          "last": ">>"
        },
        "aria": {
          "sortAscending": ": активировать для сортировки столбца по возрастанию",
          "sortDescending": ": активировать для сортировки столбца по убыванию"
        }
      }
    }
  };
  var language = Helper.L10n.getLanguage();
  var locale = locales[language] || {};

  if ($.fn.datepicker) {
    $.extend($.fn.datepicker.defaults, {
      autoclose: true,
      todayHighlight: true
    }, locale.datepicker);
  }

  if ($.fn.datetimepicker) {
    $.fn.datetimepicker.defaultOpts = $.extend({
      format: 'MM/DD/YYYY HH:mm:ss',
      showClear: true,
      showClose: true,
      ignoreReadonly: true,
      defaultDate: false
    }, locale.datetimepicker);
  }

  if ($.fn.dataTable) {
    $.extend($.fn.dataTable.defaults, {
      paging: true,
      scrollX: true,
      lengthChange: true,
      lengthMenu: [10, 25, 50],
      searching: true,
      ordering: true,
      info: true,
      autoWidth: false,
      language: locale.dataTable
    });
    $.fn.dataTable.ext.errMode = 'none';
  }

  setTimeout(function () {
    createStudio();
  }, 10);

  function createStudio () {
    if (window.Studio) {
      $('.studio-main').each(function () {
        new Studio($(this));
      });
    }
  }

  function setLanguage () {
    var language = navigator.language || navigator.userLanguage;
    switch (location.hash) {
      case '#en': language = 'en'; break;
      case '#ru': language = 'ru'; break;
    }
    Helper.L10n.setLanguage(language);
    var $bar = $('.language-bar');
    $bar.children('[data-language="'+ Helper.L10n.getLanguage() +'"]').hide();
    $bar.show();
  }
});