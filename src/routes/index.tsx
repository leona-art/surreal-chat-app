import { Match, Show, Switch, createEffect, createSignal, onMount } from "solid-js";
import { A, useNavigate } from "solid-start";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { css } from "~/styled-system/css";
import { db as surreal } from "~/root";
import { Text } from "~/components/ui/text";

type User = {
  id: string,
  name: string
  email: string
  createdAt: Date
}
export default function Home() {
  const [name, setName] = createSignal("")
  const navigate = useNavigate()
  const [user, setUser] = createSignal<User>()
  createEffect(async () => {
    const token = sessionStorage.getItem("token")
    const db = surreal()
    if (!token || !db) return
    await db.authenticate(token)
    const [user] = (await db.select<Omit<User, "createdAt"> & { created_at: string }>("user"))
      .map(e => ({ ...e, createdAt: new Date(e.created_at) })) satisfies User[]
    setUser(user)
  })
  return (
    <main class={css({
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      marginY: "12"
    })}>
      <Show when={user()}>
        {user => (
          <Card.Root width="md" height="xs">
            <Card.Header>
              <Card.Title>Profile</Card.Title>
            </Card.Header>
            <Card.Body>
              <Text>Name: {user().name}</Text>
              <Text>Email: {user().email}</Text>
            </Card.Body>
            <Card.Footer>
              <Button onClick={() => navigate(`/chat/${user().id}`)}>
                go
              </Button>
            </Card.Footer>
          </Card.Root>
        )}
      </Show>
    </main>
  );
}
