import { Match, Switch, createResource, createSignal, onMount } from "solid-js";
import { Outlet } from "solid-start";
import { Surreal } from "surrealdb.js";

export const db = new Surreal();

export default function Layout() {
    type ConnectionState = {
        state: "connecting",
    } | {
        state: "connected"
    } | {
        state: "error"
    }
    const [state, setState] = createSignal<ConnectionState>({ state: "connecting" })
    onMount(async () => {
        const connect: ConnectionState = await db.connect("ws://localhost:8080", {
            namespace: "chat",
            database: "chat",
            auth: {
                username: "root",
                password: "root"
            }
        })
            .then(() => ({ state: "connected" }) satisfies ConnectionState)
            .catch(() => ({ state: "error" }) satisfies ConnectionState)
        setState(connect)
    })
    return (
        <main>
            <Switch>
                <Match when={state().state === "connecting"}>connecting</Match>
                <Match when={state().state === "connected"}>
                    <Outlet />
                </Match>
                <Match when={state().state === "error"}>error</Match>
            </Switch>
        </main>
    )
}