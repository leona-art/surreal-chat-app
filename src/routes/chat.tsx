import { Accessor, Match, Switch, createContext, createResource, createSignal, onMount } from "solid-js";
import { Outlet } from "solid-start";
import { Surreal } from "surrealdb.js";

type ConnectionState = {
    state: "connecting",
} | {
    state: "connected",
    db: Surreal
} | {
    state: "error"
}

const connectionSignal = createSignal<ConnectionState>({ state: "connecting" })

export const connection=connectionSignal[0]
const setConection = connectionSignal[1]

export default function Layout() {
    const db = new Surreal()

    onMount(async () => {
        const connect: ConnectionState = await db.connect("ws://localhost:8080", {
            namespace: "chat",
            database: "chat",
            auth: {
                username: "root",
                password: "root"
            }
        })
            .then(() => ({ state: "connected", db }) satisfies ConnectionState)
            .catch(() => ({ state: "error" }) satisfies ConnectionState)
        setConection(connect)
    })
    return (
        <main>
            <Switch>
                <Match when={connection().state === "connecting"}>connecting</Match>
                <Match when={connection().state === "error"}>error</Match>
                <Match when={connection().state === "connected"}>
                    <Outlet />
                </Match>
            </Switch>
        </main>
    )
}