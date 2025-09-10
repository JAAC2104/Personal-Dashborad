type Importance = "Low" | "Medium" | "High"
type TaskDate = `${number}-${number}-${number}`

type Task = {id: number, name: string, dueDate: TaskDate | null, importance: Importance, done: boolean};
export let tasks: Task[] = [];
export let completedTasks: Task[] = [];

export async function TasksPage(): Promise<string>{
    return `
        <div class="container mt-5">
            <div class="row g-5">

                <div class="col-12 col-lg-6">
                    <h1 class="text-center">Create Task</h1>
                    <form class="justify-content-center" id="taskForm">
                        <div class="w-75 m-auto">
                            <label for="taskName" class="form-label m-2">Task Name</label>
                            <input type="text" class="form-control" id="taskName" name="taskName" required>
                        </div>
                        <div class="w-75 m-auto">
                            <label for="dateInput" class="form-label m-2">Due date</label>
                            <input type="date" class="form-control" id="dateInput" name="taskDate">
                        </div>
                        <div class="w-75 m-auto">
                            <label for="importance" class="form-label m-2">Importance</label>
                            <select class="form-select" aria-label="Default select example" id="importance" name="importance">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div class="w-75 m-auto">
                            <button type="submit" class="btn btn-primary my-3" id="createTask"><i class="bi bi-plus-lg m-1"></i>Create</button>
                        </div>
                    </form>
                </div>

                <div class="col-12 col-lg-6">
                    <h1 class="text-center">Tasks</h1>
                    <div id="tasksContainer">
                    </div>
                </div>
            </div>
        </div>
    `
}

function generateId():number{
    let randomId: number;
    do{
        randomId = Math.floor(Math.random() * (9999 - 1) + 1)
    } while(tasks.some(task => task.id === randomId))
    
    return randomId;
}

export function initTasksPage(){

    const taskForm = document.querySelector<HTMLFormElement>("#taskForm")!;
    const tasksContainer = document.querySelector<HTMLDivElement>("#tasksContainer")!;

    function renderTasks() {
        tasksContainer.innerHTML = '';
        tasks.forEach(task => {
            renderTask(task);
        });
    }

    tasks = loadTasks<Task>("tasks");
    completedTasks = loadTasks<Task>("completedTasks");

    renderTasks();

    taskForm.addEventListener("submit", (e) =>{
        e.preventDefault();
        const formData = new FormData(taskForm);
        const name = String(formData.get("taskName")).trim();
        if(name === "")return
        const dueDate = formData.get("taskDate") as TaskDate || null;
        const importance = formData.get("importance") as Importance || "Low";
        if (!name) return;

        let newTask: Task = {
            id: generateId(),
            name: name,
            dueDate: dueDate,
            importance: importance,
            done: false
        }

        tasks.push(newTask);

        saveTasks(tasks, "tasks");

        renderTask(newTask);
        taskForm.reset();
    })

    function renderTask(task: Task){
        const html = `
            <div class="card mb-3 shadow-sm" data-id="${task.id}">
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0" id="taskTitle" data-id="${task.id}">${task.name}</h5>
                        <span class="badge ${task.importance === "High" ? "bg-danger" : task.importance === "Medium" ? "bg-warning text-dark" : "bg-success"}"> ${task.importance} </span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small class="text-muted">Due Date: ${task.dueDate ?? "No date"}</small>
                        <div class="form-check m-0">
                            <input class="form-check-input" type="checkbox" value="done" id="done-${task.id}" data-id="${task.id}" ${task.done ? "checked disabled" : ""}>
                            <label class="form-check-label" for="done-${task.id}">Done</label>
                        </div>
                    </div>

                    <div class="d-flex gap-3 mt-3">
                        <button type="button" class="btn btn-secondary btn-sm flex-fill" data-bs-toggle="modal" data-bs-target="#modal-${task.id}">Edit</button>

                        <div class="modal fade" id="modal-${task.id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modalLabel-${task.id}" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h1 class="modal-title fs-5" id="modalLabel-${task.id}">Edit Task</h1>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div class="modal-body">
                                        <label class="form-label" for="editTask-${task.id}">New task name:</label>
                                        <input type="text" class="form-control" id="editTask-${task.id}" name="editTask" placeholder="New name">
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-success" data-id="${task.id}">Confirm</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="button" class="btn btn-danger btn-sm flex-fill" data-id="${task.id}">Delete</button>
                    </div>
                </div>
            </div>
        `
        tasksContainer?.insertAdjacentHTML("beforeend", html);

        const deleteBtns = document.querySelectorAll<HTMLButtonElement>(`.btn-danger[data-id="${task.id}"]`);
        const confirmBtns = document.querySelectorAll<HTMLButtonElement>(`.btn-success[data-id="${task.id}"]`);
        const editTask = document.querySelector<HTMLInputElement>(`#editTask-${task.id}`);

        confirmBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const btn = e.target as HTMLButtonElement;
                const idAttribute = btn.dataset.id;

                if(!idAttribute) return
                const taskId = Number(idAttribute);

                const taskTitle = document.querySelector<HTMLHeadingElement>(`#taskTitle[data-id="${taskId}"]`);
                const foundTask = tasks.find(task => task.id === taskId)
                if(!foundTask) return
                
                if(editTask === null){
                    return
                } else {
                    let newName = editTask.value.trim()
                    if(newName === "") return;
                    foundTask.name = newName;
                    saveTasks(tasks, "tasks");
                    if(!taskTitle) return;
                    taskTitle.innerText = newName;
                }
            });
        });

        deleteBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const btn = e.target as HTMLButtonElement;
                const idAttribute = btn.dataset.id;

                if(!idAttribute) return
                const taskId = Number(idAttribute);

                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks.splice(taskIndex, 1);
                    saveTasks(tasks, "tasks");
                }
                deleteTask(taskId);
            });
        });

        const doneCheck = document.querySelector<HTMLInputElement>(`#done-${task.id}`);

        doneCheck?.addEventListener("click", (e) =>{
            const btn = e.target as HTMLInputElement;
            const idAttribute = btn.dataset.id;

            if(!idAttribute) return
            const taskId = Number(idAttribute);

            const foundTask = tasks.find(task => task.id === taskId);

            if(!foundTask) return;

            foundTask.done = true;

            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                saveTasks(tasks, "tasks");
            }
            
            completedTasks.push(foundTask);
            doneCheck.setAttribute("disabled", "");
            saveTasks(tasks, "tasks");
            saveTasks(completedTasks, "completedTasks");

            console.log(tasks)
            console.log(completedTasks)
        })

    }
}

export function saveTasks(list: Task[], listName: string) {
    localStorage.setItem(listName, JSON.stringify(list));
}

function loadTasks<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  const parsed = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

function deleteTask(taskId: number){
    const taskToDelete = document.querySelector<HTMLDivElement>(`[data-id="${taskId}"]`);
    taskToDelete?.remove();
}