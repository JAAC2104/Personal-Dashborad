type Route = {
  render: () => Promise<string> | string;
  mount?: () => void;
};

type RouteMap = Record<string, Route>;

export class Router{
    constructor(private outlet: HTMLElement, private routes: RouteMap){
        window.addEventListener("hashchange", () => this.resolve());
        window.addEventListener("DOMContentLoaded", () => this.resolve());
    }

    async resolve() {
        const path = location.hash.replace(/^#/, "") || "/tasks";
        const route = this.routes[path] ?? this.routes["/tasks"];
        const html = await route.render();
        this.outlet.innerHTML = html;
        route.mount?.();
  }
} 