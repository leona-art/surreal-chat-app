import { Accessor, Match, Switch, createContext, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Outlet } from "solid-start";
import { Surreal } from "surrealdb.js";
import { Card } from "~/components/ui/card";
import { surreal, setSurreal } from "~/root";
import { css } from "~/styled-system/css";


export default function Layout() {

    onMount(async () => {
        const connect = await surreal.db.connect("ws://localhost:8080/", {
            namespace: "chat",
            database: "chat",
            auth: {
                username: "root",
                password: "root"
            }
        })
            .then(() => "connected" as const)
            .catch(() => "error" as const)
        setSurreal("connection", connect)
    })
    return (
        <main class={css({
            height: "100vh"
        })}>
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