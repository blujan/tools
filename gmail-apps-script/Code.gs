//
// Automatically archive anything in the inbox older the x number of days
//
function ArchiveInbox() {
  var delayDays = 90 // Enter # of days before messages are moved to archive
  var maxDate = new Date();
  maxDate.setDate(maxDate.getDate()-delayDays);
  var label = GmailApp.getInboxThreads();
  var threads = label.getThreads();
  for (var i = 0; i < threads.length; i++) {
    if (threads[i].getLastMessageDate()<maxDate)
      {
        threads[i].moveThreadToArchive();
      }
  }
}

