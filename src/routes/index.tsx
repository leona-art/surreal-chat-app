import { Match, Show, Switch, createEffect, createSignal, onMount } from "solid-js";
import { A, Navigate, useNavigate } from "solid-start";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { db as surreal } from "~/root";
import { Text } from "~/components/ui/text";
import { Center } from "~/styled-system/jsx";

type User = {
  id: string,
  name: string
  email: string
  createdAt: Date
}
export default function Home() {
  const navigate = useNavigate()
  const [auth, setAuth] = createSignal<"authenticated" | "not">()
  const [user, setUser] = createSignal<User>()

  createEffect(async () => {
    const token = sessionStorage.getItem("token")
    const db = surreal()
    if (!token) {
      setAuth("not")
      return
    }
    if (!db) return
    try {
      await db.authenticate(token)
      const [[user]] = (await db.query<[[Omit<User, "createdAt"> & { created_at: string }]]>("SELECT * FROM $auth;"))

      setAuth("authenticated")
      setUser({ ...user, createdAt: new Date(user.created_at) })
    } catch (e) {
      console.error(e)
      setAuth("not")
    }
  })
  const signOut = async () => {
    const db = surreal()
    if (!db) return
    await db.invalidate()
    sessionStorage.removeItem("token")
    setUser(undefined)
    navigate("/sign-in")
  }
  return (
    <Center>
      <Switch>
        <Match when={auth() === "authenticated" && user()}>
          {user => (
            <Card.Root width="md" height="xs" marginY={20}>
              <Card.Header>
                <Card.Title>Profile</Card.Title>
              </Card.Header>
              <Card.Body>
                <Text>Name: {user().name}</Text>
                <Text>Email: {user().email}</Text>
              </Card.Body>
              <Card.Footer justifyContent="space-between">
                <Button variant="outline" onClick={signOut}>
                  sign out
                </Button>
                <Button asChild>
                  <A href="/chat">go chat</A>
                </Button>

              </Card.Footer>
            </Card.Root>
          )}
        </Match>
        <Match when={auth() === "not"}>
          <Navigate href="/sign-in" />
        </Match>
        <Match when={true}>
          Wait...
        </Match>
      </Switch>
    </Center>
  );
}
