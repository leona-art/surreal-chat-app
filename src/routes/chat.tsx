import { Match, Switch, createEffect, createMemo, createResource, createSignal, useContext } from "solid-js";
import { Navigate, Outlet } from "solid-start";
import { db as surreal } from "~/root";
import { css } from "~/styled-system/css";
import { User, setUser } from "~/lib/user";


type Raw<T> = Omit<T, "createdAt"> & { created_at: string }
export default function Layout() {
    const [isAuthenticated, setIsAuthenticated] = createSignal<{ state: "not" } | { state: "authenticated", user: User }>()
    createEffect(async () => {
        const token = sessionStorage.getItem("token")
        const db = surreal()
        if (!token) {
            setIsAuthenticated({ state: "not" })
            return
        }
        if (!db) return
        try {
            await db.authenticate(token)
            const [user_] = await db.query<[Raw<User>]>("SELECT * FROM ONLY $auth;")
            const user = { ...user_, createdAt: new Date(user_.created_at) }
            setIsAuthenticated({ state: "authenticated", user })
            setUser("value", user)
        } catch (e) {
            console.error(e)
            setIsAuthenticated({ state: "not" })
        }
    })
    const authenticated = createMemo(() => {
        const auth = isAuthenticated()
        return auth && auth.state === "authenticated" && auth
    })
    const notAuthenticated = createMemo(() => {
        const auth = isAuthenticated()
        return auth && auth.state === "not" && auth
    })
    return (
        <main class={css({
            height: "100vh"
        })}>
            <Switch fallback={<>wait..</>}>
                <Match when={authenticated()}>
                    {auth => (
                        <>
                            {auth().user.name}- {auth().user.id}
                            <Outlet />
                        </>
                    )}
                </Match>
                <Match when={notAuthenticated()}>
                    <Navigate href="/sign-in" />
                </Match>
            </Switch>
        </main>
    )
}