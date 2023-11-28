import { Match, Switch, createResource, useContext } from "solid-js";
import { Outlet } from "solid-start";
import { db as surreal } from "~/root";
import { css } from "~/styled-system/css";


export default function Layout() {
    const [isAuthenticated] = createResource(async () => {
        const db = surreal()
        if (!db) return false
        try {
            // await db.signin({
            //     namespace: "dev",
            //     database: "chat",
            //     scope: "user",
            //     email: "test@ts.com",
            //     password: "1111"
            // })
            // await db.use({
            //     namespace: "dev",
            //     database: "chat"
            // })
            return true
        } catch (e) {
            return false
        }
    }
    )
    return (
        <main class={css({
            height: "100vh"
        })}>
            <Switch>
                <Match when={isAuthenticated()}>
                    <Outlet />
                </Match>
                <Match when={!isAuthenticated()}>
                    Not Authenticated
                </Match>
            </Switch>
        </main>
    )
}