import { completedTasks } from "./tasks"
import { tasks } from "./tasks"

type Importance = "Low" | "Medium" | "High"
type TaskDate = `${number}-${number}-${number}`
type Task = {id: number, name: string, dueDate: TaskDate | null, importance: Importance, done: boolean};

export async function StatsPage(): Promise<string>{
    return `
        <div class="container">
            <div class="row mt-5 g-5">
                <div class="col-12 col-lg-4">
                    <h2 class="text-center">Pending Tasks</h2>
                    <h1 class="text-center text-warning">${tasks.length}</h1>
                </div>
                <div class="col-12 col-lg-4">
                    <h2 class="text-center">Finished Tasks</h2>
                    <h1 class="text-center text-success">${completedTasks.length}</h1>
                </div>
                <div class="col-12 col-lg-4">
                    <h2 class="text-center">History<h2>
                    <div id="historyContainer"></div>
                </div>
            </div>
        </div>
    `
}

const STORAGE = {
  load<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch { return []; }
  }
};

export function initStatsPage() {
  const historyContainer = document.querySelector<HTMLDivElement>("#historyContainer");
  if (!historyContainer) return;

  const allCompleted = STORAGE.load<Task>("completedTasks");
  const pending = STORAGE.load<Task>("tasks");

  const pendingEl = document.querySelector(".text-warning");
  const finishedEl = document.querySelector(".text-success");
  if (pendingEl) pendingEl.textContent = String(pending.length);
  if (finishedEl) finishedEl.textContent = String(allCompleted.length);

  historyContainer.innerHTML = "";
  const last10 = allCompleted.slice(-10).reverse();

  last10.forEach(task => {
    const html = `
      <div class="card mb-2 border-0 shadow-sm" data-id="${task.id}">
        <div class="card-body py-2 px-3 small">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fs-5 text-muted text-decoration-line-through">${task.name}</span>
            <span class="badge fs-6 rounded-pill ${
              task.importance === "High" ? "bg-danger" :
              task.importance === "Medium" ? "bg-warning text-dark" : "bg-success"
            } px-2 py-1 small">${task.importance}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <small class="fs-6 text-muted">Due: ${task.dueDate ?? "No date"}</small>
            <div class="form-check m-0 p-0">
              <input class="form-check-input fs-4" type="checkbox" checked disabled id="done-${task.id}" style="transform:scale(0.8);">
              <label class="form-check-label text-muted fs-4" for="done-${task.id}">Done</label>
            </div>
          </div>
        </div>
      </div>`;
    historyContainer.insertAdjacentHTML("beforeend", html);
  });
}