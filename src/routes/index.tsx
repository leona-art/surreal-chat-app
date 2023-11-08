import { Match, Switch, createSignal } from "solid-js";
import { A, useNavigate } from "solid-start";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { css } from "~/styled-system/css";

export default function Home() {
  const [name, setName] = createSignal("")
  const navigate=useNavigate()
  return (
    <main class={css({
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      marginY: "12"
    })}>
      <Card.Root width="md" height="xs">
        <Card.Header>
          <Card.Title>Your name</Card.Title>
        </Card.Header>
        <Card.Body>
          <Label for="name">Name</Label>
          <Input id="name" value={name()} onInput={(e) => { setName(e.target.value) }} />

        </Card.Body>
        <Card.Footer>
          <Button onClick={()=>navigate(`/chat/${name()}`)} disabled={name()===""}>
            go
          </Button>
        </Card.Footer>
      </Card.Root>
    </main>
  );
}
