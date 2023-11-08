import { Accessor, Match, Switch, createContext, createResource, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Outlet } from "solid-start";
import { Surreal } from "surrealdb.js";


const dbStore=createStore<{db:Surreal,connection:"yet"|"connected"|"error"}>({
    db:new Surreal(),
    connection:"yet"
})
export const surreal=dbStore[0]
const setSureralState=dbStore[1]



export default function Layout() {

    onMount(async () => {
        const connect = await surreal.db.connect("ws://localhost:8080", {
            namespace: "chat",
            database: "chat",
            auth: {
                username: "root",
                password: "root"
            }
        })
            .then(() => "connected" as const)
            .catch(() => "error" as const)
        setSureralState("connection",connect)
    })
    return (
        <main>
            <Switch>
                <Match when={surreal.connection === "yet"}>connecting</Match>
                <Match when={surreal.connection === "error"}>error</Match>
                <Match when={surreal.connection === "connected"}>
                    <Outlet />
                </Match>
            </Switch>
        </main>
    )
}