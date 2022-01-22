// ==UserScript==
// @name         bbtimer
// @namespace    http://tampermonkey.net/
// @version      20220121
// @description  BB Wait Timer
// @author       Crabby
// @downloadURL
// @updateURL
// @match        https://www.bestbuy.com/*
// @grant        none
// ==/UserScript==


const waitPollMs = 100;

const Waiter = {
  waitForFn: (async (fn, timeMs = 5000) => {
    let found = undefined;
    let attempts = 0;
    const maxWaitAttempts = timeMs / waitPollMs;
    while (!found && attempts < maxWaitAttempts) {
      attempts++;
      found = fn();
      await Waiter.waitMs(waitPollMs);
    }
    return found;
  }),
  waitMs: (timeMs) => new Promise((resolve) => setTimeout(resolve, timeMs)),
  waitForSelector: async (selector, timeMs = 5000) => {
    let found = undefined;
    let attempts = 0;
    const maxWaitAttempts = timeMs / waitPollMs;
    while (!found && attempts < maxWaitAttempts) {
      attempts++;
      found = document.querySelector(selector);
      await Waiter.waitMs(waitPollMs);
    }
    return found;
  }
}

function n(e, t) {
  return parseInt(e, t)
}

function r(e, t) {
  return e[t]
}

function getQueueTimeFromEncodedString(e) {
  var t = ("-", e.split("-")),
    l = t.map((function (e) {
      return n(e, 16)
    }));
  return function (e) {
    return 1e3 * e
  }(function (e, t) {
    return e / t
  }(n(function (e, t) {
    return e + t
  }(r(t, 2), r(t, 3)), 16), r(l, 1)))
}

function getRecordForSku(sku){
  const queues= JSON.parse(atob(localStorage.getItem('purchaseTracker')));
  console.log(queues);

  const skuQueue = queues[sku];
  if(!skuQueue){
    return null;
  }
  return skuQueue;
}

function getQueueTimeStartMs(sku)  {
  return getRecordForSku(sku)[0];
}

function getQueueDurationMs(sku)  {
  return getQueueTimeFromEncodedString(getRecordForSku(sku)[2]);
}

var sku = location.search.split('=')[1];
console.log('found sku', sku);

let checkQueueTimeRemaining = () => {
  try {
    var startMs = getQueueTimeStartMs(sku);
    var durationMs = getQueueDurationMs(sku);
    var remainingMs = startMs + durationMs - new Date().getTime();
    if (remainingMs / 1000 < 90) {
      document.body.style = 'background-color:#F00';
	  }
	if (remainingMs / 1000 < 30) {
      document.body.style = 'background-color:#FF0';
    }
	if (remainingMs / 1000 < 10) {
      document.body.style = 'background-color:#CFC';
    }

    dataDiv.textContent = `start: ${new Date(startMs)} duration: ${durationMs / 1000}s remaining: ${remainingMs / 1000}s`
  } catch (e) {
  }
};
setInterval(checkQueueTimeRemaining, 1000);

var dataDiv = document.createElement('div');
var queueTimeMsg = document.createElement('h4');
queueTimeMsg.textContent = 'no queue';
dataDiv.appendChild(queueTimeMsg);
document.querySelector('.sku-title').after(dataDiv);
