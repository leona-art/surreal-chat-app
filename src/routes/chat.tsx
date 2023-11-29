import { Match, Switch, createEffect, createMemo, createResource, createSignal, useContext } from "solid-js";
import { Navigate, Outlet } from "solid-start";
import { db as surreal } from "~/root";
import { css } from "~/styled-system/css";

type User = {
    id: string,
    name: string
    email: string
    createdAt: Date
}
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
            const [user] = await db.query<[Raw<User>]>("SELECT * FROM ONLY $auth;")
            console.log(user)
            setIsAuthenticated({ state: "authenticated", user: { ...user, createdAt: new Date(user.created_at) } })
        } catch (e) {
            console.error(e)
            setIsAuthenticated({ state: "not" })
        }
    })
    const authenticated=createMemo(()=>{
        const auth=isAuthenticated()
        return auth&&auth.state==="authenticated"&&auth
    })
    const notAuthenticated=createMemo(()=>{
        const auth=isAuthenticated()
        return auth&&auth.state==="not"&&auth
    })
    return (
        <main class={css({
            height: "100vh"
        })}>
            <Switch fallback={<>wait..</>}>
                <Match when={authenticated()}>
                {auth=>(
                    <>
                    {auth().user.name}
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