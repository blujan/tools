/* For a given date, get the ISO week number
 *
 * Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
/// From https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  // Return array of year and week number
  return ((d.getUTCFullYear() * 100) + weekNo);
}

async function TrashThreads(threads) {
  await GmailApp.moveThreadsToTrash(threads);
}

function Trash(search, index) {
  Logger.log("Starting Trash...");
  var total = 0;
  var start = 0;
  do {
    var threads = GmailApp.search(search, start, 500);
    total += threads.length;
    var i, j, threadarray, chunk = 50;
    for (i = 0, j = threads.length; i < j; i += chunk) {
      threadarray = threads.slice(i, i + chunk);
      TrashThreads(threadarray);
    }
  } while (threads.length == 500);
  Logger.log('Total threads processed: ' + total);
}

function Archive(search, index) {
  Logger.log("Starting Archive...");
  var total = 0;
  do {
    var threads = GmailApp.search(search, 0, 100);
    total += threads.length;
    GmailApp.moveThreadsToArchive(threads);
  } while (threads.length == 100);
  Logger.log('Total threads processed: ' + total);
}

function LabelThreadsWorker(data, threads) {
  var labels = data[0];
  var times = data[1];

  for (var i = threads.length; i--;) {
    var thread_labels = threads[i].getLabels();
    var thread_date = threads[i].getLastMessageDate();
    thread_date.setHours(0, 0, 0, 0);
    var thread_week_number = getWeekNumber(thread_date);

    for (var k = labels.length; k--;) {
      // removeLabel does not to an automatic refresh compared to
      // label.removeFromThreads()
      if (thread_labels.includes(labels[k])) {
        threads[i].removeLabel(labels[k]);
      }
    }
    if (thread_date.getTime() === times[0]) {
      // Yesterday
      threads[i].addLabel(labels[0]);
    } else if (thread_date.getTime() === times[1]) {
      // Ereyesterday
      threads[i].addLabel(labels[1]);
    }
    if (thread_week_number == times[2]) {
      // Last Week
      threads[i].addLabel(labels[2]);
    } else if (thread_week_number == times[3]) {
      // Two Weeks Ago
      threads[i].addLabel(labels[3]);
    }
  }
}

async function LabelThreads(data, threads) {
  await LabelThreadsWorker(data, threads);
}

function GetDateDaysOffsetFrom(day_offset) {
  var new_date = new Date();
  new_date.setDate(new_date.getDate() - day_offset);
  new_date.setHours(0, 0, 0, 0);
  return new_date;
}

function GetLabelsAndDates() {
  // Generate GmailLabel[] object
  var labels = ["Yesterday", "Ereyesterday", "Last Week", "Two Weeks Ago"];
  var label_array = [];
  var j;
  for (var i = 0, j = labels.length; i < j; i++) {
    label_array.push(GmailApp.getUserLabelByName(labels[i]));
  }
  // Generate the time objects
  Logger.log('Current week #: ' + getWeekNumber(GetDateDaysOffsetFrom(0)));

  var yesterday = GetDateDaysOffsetFrom(1);
  var ereyesterday = GetDateDaysOffsetFrom(2);
  var last_week = getWeekNumber(GetDateDaysOffsetFrom(7));
  var week_before_last = getWeekNumber(GetDateDaysOffsetFrom(14));

  var times = [yesterday.getTime(), ereyesterday.getTime(), last_week, week_before_last];
  return [label_array, times];
}

function UpdateLabels(search, index) {
  Logger.log("Starting UpdateLabels...");
  var data = GetLabelsAndDates();
  var total = 0;
  var start = 0;
  do {
    var threads = GmailApp.search(search, start, 500);
    total += threads.length;
    start += 500;
    var i, j, threadarray, chunk = 50;
    for (i = 0, j = threads.length; i < j; i += chunk) {
      threadarray = threads.slice(i, i + chunk);
      LabelThreads(data, threadarray);
    }
  } while (threads.length == 500);
  Logger.log('Total threads processed: ' + total);
}

function cleanUp() {
  var searches = ['older_than:30d category:promotions', 'older_than:30d label:Temp category:social'];
  searches.forEach(Trash);
}

function ArchiveInbox() {
  var searches = ['older_than:60d category:primary'];
  searches.forEach(Archive);
}

function TagEmails() {
  var searches = ['category:primary -older_than:30d'];
  searches.forEach(UpdateLabels);
}

