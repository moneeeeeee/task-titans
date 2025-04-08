let startTime, interval, pausedTime = 0;
let running = false, paused = false;

const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const taskSelect = document.getElementById("taskSelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const newTaskSection = document.getElementById("newTaskSection");
const newTaskInput = document.getElementById("newTaskInput");
const confirmAddTask = document.getElementById("confirmAddTask");



startBtn.onclick = () => {
  if (!running) {
    startTime = Date.now() - pausedTime;
    running = true;
    paused = false;
    interval = setInterval(updateTimer, 10);
    statusEl.innerText = "⏱️ Running...";
  }
};

pauseBtn.onclick = () => {
  if (running && !paused) {
    clearInterval(interval);
    pausedTime = Date.now() - startTime;
    paused = true;
    running = false;
    statusEl.innerText = "⏸️ Paused";
  } else if (!running && paused) {
    startTime = Date.now() - pausedTime;
    interval = setInterval(updateTimer, 10);
    running = true;
    paused = false;
    statusEl.innerText = "⏱️ Resumed";
  }
};

stopBtn.onclick = async () => {
  if (running || pausedTime > 0) {
    clearInterval(interval);
    running = false;

    const totalDuration = paused ? pausedTime : (Date.now() - startTime);
    const seconds = Math.round(totalDuration / 1000);

    const task = taskSelect.value.trim();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!task || !userId || !token) {
      statusEl.innerText = "⚠️ Missing task, user ID or token.";
      return;
    }

    statusEl.innerText = "🔄 Logging...";

    try {
      const res = await fetch(`http://localhost:5000/api/user/${userId}/log-chore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskName: task, duration: seconds }),
      });

      const data = await res.json();
      if (res.ok) {
        statusEl.innerText = `✅ Logged in ${data.groupsUpdated} groups.\n${data.messages.join("\n")}`;
      } else {
        statusEl.innerText = `❌ ${data.error || data.message}`;
      }
    } catch (err) {
      statusEl.innerText = `❌ Request failed: ${err.message}`;
    }

    pausedTime = 0;
  }
};

resetBtn.onclick = () => {
  clearInterval(interval);
  running = false;
  paused = false;
  pausedTime = 0;
  timerEl.textContent = "00:00:00:000";
  statusEl.innerText = "";
};

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const date = new Date(elapsed);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
  timerEl.textContent = `${hh}:${mm}:${ss}:${ms}`;
}

// Local task list for simplicity
let taskList = ["Washing Dishes", "Cleaning Room", "Cooking"];

// Load dropdown options
function loadTasks() {
  taskSelect.innerHTML = `<option value="" disabled selected>Select a task</option>`;
  taskList.forEach((task) => {
    const option = document.createElement("option");
    option.value = task;
    option.textContent = task;
    taskSelect.appendChild(option);
  });
}
loadTasks();

addTaskBtn.onclick = () => {
  newTaskSection.style.display = "block";
};

confirmAddTask.onclick = () => {
  const newTask = newTaskInput.value.trim();
  if (newTask && !taskList.includes(newTask)) {
    taskList.push(newTask);
    newTaskInput.value = "";
    newTaskSection.style.display = "none";
    loadTasks();
    taskSelect.value = newTask;
  }
};