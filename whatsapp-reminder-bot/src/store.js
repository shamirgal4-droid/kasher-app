'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const EMPTY = { tasks: [], reminders: [], nextId: 1 };

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
      nextId: typeof parsed.nextId === 'number' ? parsed.nextId : 1,
    };
  } catch (err) {
    // קובץ לא קיים / פגום — מתחילים נקי
    return { ...EMPTY };
  }
}

let state = load();

function save() {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function genId() {
  const id = state.nextId++;
  save();
  return id;
}

// ---- משימות ----
function addTask(text) {
  const task = { id: genId(), text, createdAt: new Date().toISOString() };
  state.tasks.push(task);
  save();
  return task;
}

function listTasks() {
  return state.tasks.slice();
}

/** מסמן משימה כבוצעה (מסיר) לפי מיקום ברשימה (1-based). מחזיר את המשימה או null. */
function completeTaskByIndex(index) {
  const i = index - 1;
  if (i < 0 || i >= state.tasks.length) return null;
  const [removed] = state.tasks.splice(i, 1);
  save();
  return removed;
}

function deleteTaskByIndex(index) {
  return completeTaskByIndex(index);
}

function clearTasks() {
  const count = state.tasks.length;
  state.tasks = [];
  save();
  return count;
}

// ---- תזכורות ----
/**
 * reminder: { id, chatId, text, time (ISO|null), recurring: {hour,minute}|null }
 */
function addReminder(reminder) {
  const full = { id: genId(), ...reminder };
  state.reminders.push(full);
  save();
  return full;
}

function listReminders() {
  return state.reminders.slice();
}

function removeReminderById(id) {
  const i = state.reminders.findIndex((r) => r.id === id);
  if (i === -1) return null;
  const [removed] = state.reminders.splice(i, 1);
  save();
  return removed;
}

function removeReminderByIndex(index) {
  const i = index - 1;
  if (i < 0 || i >= state.reminders.length) return null;
  const reminder = state.reminders[i];
  return removeReminderById(reminder.id);
}

module.exports = {
  DATA_FILE,
  addTask,
  listTasks,
  completeTaskByIndex,
  deleteTaskByIndex,
  clearTasks,
  addReminder,
  listReminders,
  removeReminderById,
  removeReminderByIndex,
};
