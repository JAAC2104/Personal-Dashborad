import "./styles/main.scss"
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Router } from "./router"
import { TasksPage } from "./pages/tasks";
import { StatsPage } from "./pages/stats";
import { initTasksPage } from "./pages/tasks";
import { initStatsPage } from "./pages/stats";


const outlet = document.getElementById("app")!;
const router = new Router(outlet, {
    "/tasks": {render: TasksPage, mount: initTasksPage},
    "/stats": {render: StatsPage, mount: initStatsPage}
})

router.resolve();

document.getElementById("colorModeSwitch")!.addEventListener("click", () => {
    if (document.documentElement.getAttribute("data-bs-theme") === "dark") {
        document.documentElement.setAttribute("data-bs-theme", "light");
    } else {
        document.documentElement.setAttribute("data-bs-theme", "dark");
    }
});

const THEME_KEY = "theme";
const root = document.documentElement;
const toggle = document.getElementById("colorModeSwitch") as HTMLInputElement;

const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
const initialTheme = saved ?? "light";
root.setAttribute("data-bs-theme", initialTheme);
if (toggle) toggle.checked = initialTheme === "dark";

toggle?.addEventListener("change", () => {
  const theme = toggle.checked ? "dark" : "light";
  root.setAttribute("data-bs-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
});