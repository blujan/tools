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
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    //return [d.getUTCFullYear(), weekNo];
    return ((d.getUTCFullYear() * 100) + weekNo);
}

async function TrashThreads(threads) {
  await GmailApp.moveThreadsToTrash(threads);
}

function Trash(search, index) {
  var total = 0;
  var start = 0;
  do {
    var threads = GmailApp.search(search, start, 500);
    //Logger.log(threads.length);
    total = total + threads.length;
    var i,j,threadarray,chunk = 50;
    for (i=0,j=threads.length; i < j; i += chunk) {
      threadarray = threads.slice(i, i + chunk);
      TrashThreads(threadarray);
    }
    //start = start + 500;
  } while (threads.length == 500);
  Logger.log('[' + search + '] Threads moved to trash: ' + total);
}

function Archive(search, index) {
  var total = 0;
  var start = 0;
  do {
    var threads = GmailApp.search(search, 0, 100);
    Logger.log(threads.length);
    total = total + threads.length;
    Logger.log(total);
    GmailApp.moveThreadsToArchive(threads);
    //for (var i = 0; i < threads.length; i++) {
    //  threads[i].moveToArchive();
    //}
    //start = start + 100;
  } while (threads.length == 100);
  Logger.log('Threads archived: ' + total);
}

function TagWorker_2(yesterday, currentweek, threads) {
  var yest_label = GmailApp.getUserLabelByName("Yesterday");
  var lastw_label = GmailApp.getUserLabelByName("Last Week");
  var twow_label = GmailApp.getUserLabelByName("Two Weeks Ago");
  for (var i = 0; i < threads.length; i++) {
    var msgDate = threads[i].getLastMessageDate();
    msgDate.setHours(0, 0, 0, 0);
    var msgWeek = getWeekNumber(msgDate);
    //Logger.log('Msg Week: ' + msgWeek);
    var msgLabels = threads[i].getLabels();
    //Logger.log(msgDate);
    if (msgDate.getTime() === yesterday.getTime()) { // thread date == yesterday
      threads[i].addLabel(yest_label);
    } else {
      if (msgLabels.includes(yest_label)) {
        threads[i].removeLabel(yest_label);
      }
      if ((currentweek - 1) == msgWeek) {
        threads[i].addLabel(lastw_label);
      } else {
        if (msgLabels.includes(lastw_label)) {          
          threads[i].removeLabel(lastw_label);
        }
        if ((currentweek - 2) == msgWeek) {
          threads[i].addLabel(twow_label);
        } else {
          if (msgLabels.includes(twow_label)) {
            threads[i].removeLabel(twow_label);
          }
        }
      }
    }
  }
}

async function TagWorker_1(yesterday, currentweek, threads) {
  await TagWorker_2(yesterday, currentweek, threads);
}

function PerformTagging(search, index) {
  Logger.log("PerformTagging");
  var total = 0;
  var yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  var today = new Date();
  var currentweek = getWeekNumber(today);
  Logger.log('Current Week #: ' + currentweek);
  var start = 0;
  do {
    var threads = GmailApp.search(search, start, 500);
    //Logger.log(threads.length);
    total = total + threads.length;
    //Logger.log(total);
    var i,j,threadarray,chunk = 50;
    for (i=0,j=threads.length; i < j; i += chunk) {
      threadarray = threads.slice(i, i + chunk);
      TagWorker_1(yesterday, currentweek, threadarray);
    }
    start = start + 500;
  } while (threads.length == 500);
  Logger.log('Total processed: ' + total);
  return total;
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
  var total = 0;
  var searches = ['category:primary -older_than:30d'];
  searches.forEach(PerformTagging);
}

