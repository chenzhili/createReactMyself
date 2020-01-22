let taskList = [];
let totalTaskCount = 0;
let currentTaskNumber = 0;
let taskHandle = null;
let totalTaskCountElem = document.getElementById("totalTaskCount");
let currentTaskNumberElem = document.getElementById("currentTaskNumber");
let progressBarElem = document.getElementById("progress");
let startButtonElem = document.getElementById("startButton");
let logElem = document.getElementById("log");
let logFragment = null;
let statusRefreshScheduled = false;


/* 测试 同时 执行 两个 requestAnimationFrame 是否是 在 同一个 event loop*/
/* 
  解答：通过调试
  requestAnimationFrame 这个是 属于 宏任务，所以 在 两个 执行的时候，是属于 不同的 event loop里的，requestIdleCallback 这个也是 一样的，只是 这个 优先级 特别低，任务比较忙的 时候，可能不会执行；
    
*/
const root = document.getElementById("root");
function fun(){
  let id1,id2;
  console.log("1111111========");
  id1 = requestAnimationFrame(function(){
    console.log(1);
    console.log(id1);
    root.innerHTML = "test1";
  });
  console.log("========");
  root.innerHTML = "========";
  setTimeout(function(){ 
    console.log("setTimeout");
    root.innerHTML = "setTimeout"; 
  },100);

  Promise.resolve("resolve").then(res=>{
    console.log("resolve");
    root.innerHTML = "resolve"; 
  });;

  requestIdleCallback(function(){
    console.log("requestIdleCallback");
    root.innerHTML = "requestIdleCallback"; 
  });

  id2 = requestAnimationFrame(function(){
    console.log(2);
    console.log(id2);
    root.innerHTML = "test2";
  });
}
fun();
window.requestIdleCallback = window.requestIdleCallback || function(handler) {
  let startTime = Date.now();
 
  return setTimeout(function() {
    handler({
      didTimeout: false,
      timeRemaining: function() {
        return Math.max(0, 50.0 - (Date.now() - startTime));
      }
    });
  }, 1);
};

window.cancelIdleCallback = window.cancelIdleCallback || function(id) {
  clearTimeout(id);
};
function enqueueTask(taskHandler, taskData) {
  taskList.push({
    handler: taskHandler,
    data: taskData
  });
 
  totalTaskCount++;
 
  if (!taskHandle) {
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 });
  }
 
  scheduleStatusRefresh();
}
function runTaskQueue(deadline) {
  while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && taskList.length) {
    let task = taskList.shift();
    currentTaskNumber++;
    
    task.handler(task.data);
    scheduleStatusRefresh();
  }
 
  if (taskList.length) {
    console.log("进来过没");
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000} );
  } else {
    taskHandle = 0;
  }
}
function scheduleStatusRefresh() {
    if (!statusRefreshScheduled) {
      requestAnimationFrame(updateDisplay);
      statusRefreshScheduled = true;
  }
}
function updateDisplay() {
  let scrolledToEnd = logElem.scrollHeight - logElem.clientHeight <= logElem.scrollTop + 1;
 
  if (totalTaskCount) {
    if (progressBarElem.max != totalTaskCount) {
      totalTaskCountElem.textContent = totalTaskCount;
      progressBarElem.max = totalTaskCount;
    }

    if (progressBarElem.value != currentTaskNumber) {
      currentTaskNumberElem.textContent = currentTaskNumber;
      progressBarElem.value = currentTaskNumber;
    }
  }
  
  if (logFragment) {
    logElem.appendChild(logFragment);
    logFragment = null;
  }
 
  if (scrolledToEnd) {
      logElem.scrollTop = logElem.scrollHeight - logElem.clientHeight;
  }
 
  statusRefreshScheduled = false;
}
function log(text) {
  if (!logFragment) {
      logFragment = document.createDocumentFragment();
  }
 
  let el = document.createElement("div");
  el.innerHTML = text;
  logFragment.appendChild(el);
}
function logTaskHandler(data) {
  log("<strong>Running task #" + currentTaskNumber + "</strong>");
 
  for (i=0; i<data.count; i+=1) {
    log((i+1).toString() + ". " + data.text);
  }
}
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function decodeTechnoStuff() {  
  totalTaskCount = 0;
  currentTaskNumber = 0;
  updateDisplay();

  let n = getRandomIntInclusive(100, 200);

  for (i=0; i<n; i++) {
    let taskData = {
      count: getRandomIntInclusive(75, 150),
      text: "This text is from task number " + (i+1).toString() + " of " + n
    };

    enqueueTask(logTaskHandler, taskData);
  }
}

document.getElementById("startButton").addEventListener("click", decodeTechnoStuff, false);