(function () {
  var OFFICE_TIME_ZONE = 'America/Chicago';
  var OPEN_HOUR = 8;
  var CLOSE_HOUR = 17;
  var WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var banner;

  function dateKey(date) {
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0')
    ].join('-');
  }

  function fixedHoliday(year, month, day) {
    var holiday = new Date(Date.UTC(year, month - 1, day));
    var weekday = holiday.getUTCDay();

    if (weekday === 6) holiday.setUTCDate(holiday.getUTCDate() - 1);
    if (weekday === 0) holiday.setUTCDate(holiday.getUTCDate() + 1);
    return holiday;
  }

  function weekdayHoliday(year, month, weekday, occurrence) {
    var holiday = new Date(Date.UTC(year, month - 1, 1));
    var offset = (weekday - holiday.getUTCDay() + 7) % 7;

    holiday.setUTCDate(1 + offset + ((occurrence - 1) * 7));
    return holiday;
  }

  function lastWeekdayHoliday(year, month, weekday) {
    var holiday = new Date(Date.UTC(year, month, 0));
    var offset = (holiday.getUTCDay() - weekday + 7) % 7;

    holiday.setUTCDate(holiday.getUTCDate() - offset);
    return holiday;
  }

  function federalHolidayKeys(year) {
    return [
      fixedHoliday(year, 1, 1),
      weekdayHoliday(year, 1, 1, 3),
      weekdayHoliday(year, 2, 1, 3),
      lastWeekdayHoliday(year, 5, 1),
      fixedHoliday(year, 6, 19),
      fixedHoliday(year, 7, 4),
      weekdayHoliday(year, 9, 1, 1),
      weekdayHoliday(year, 10, 1, 2),
      fixedHoliday(year, 11, 11),
      weekdayHoliday(year, 11, 4, 4),
      fixedHoliday(year, 12, 25)
    ].map(dateKey);
  }

  function officeTimeParts() {
    var formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: OFFICE_TIME_ZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23'
    });
    var parts = formatter.formatToParts(new Date());
    var values = {};

    parts.forEach(function (part) {
      values[part.type] = part.value;
    });

    return {
      weekday: values.weekday,
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      hour: Number(values.hour)
    };
  }

  function officeIsOpen() {
    var current = officeTimeParts();
    var currentDate = new Date(Date.UTC(current.year, current.month - 1, current.day));
    var holidayKeys = federalHolidayKeys(current.year).concat(federalHolidayKeys(current.year + 1));
    var isHoliday = holidayKeys.indexOf(dateKey(currentDate)) !== -1;

    return WEEKDAYS.indexOf(current.weekday) !== -1 &&
      !isHoliday &&
      current.hour >= OPEN_HOUR &&
      current.hour < CLOSE_HOUR;
  }

  function buildBanner() {
    var notice = document.createElement('aside');
    notice.className = 'after-hours-banner';
    notice.setAttribute('aria-label', 'After-hours crisis support');
    notice.innerHTML =
      '<div class="container after-hours-inner">' +
        '<div class="after-hours-notice">' +
        '<strong>After-hours support</strong>' +
        '<span>Our office is currently closed. If you or someone you know is in immediate danger or experiencing a medical emergency, ' +
        '<a href="tel:911">call 911</a> or go to the nearest emergency room. For mental health or ' +
        'substance use crisis support, <a href="tel:988">call</a> or <a href="sms:988">text 988</a>.</span>' +
        '</div>' +
      '</div>';
    return notice;
  }

  function updateBanner() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    if (officeIsOpen()) {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      return;
    }

    if (!banner) banner = buildBanner();
    if (!banner.parentNode) header.parentNode.insertBefore(banner, header);
  }

  function initialize() {
    updateBanner();
    window.setInterval(updateBanner, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}());
