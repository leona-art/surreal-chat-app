import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Stack } from "~/styled-system/jsx"
import { Center } from "~/styled-system/jsx"
import { db as surreal } from "~/root"
import { createSignal } from "solid-js"
import { A, useNavigate } from "solid-start"

async function signIn(email: string, password: string) {
    const db = surreal()
    if (!db) return
    try {
        return await db.signin({
            namespace: "dev",
            database: "chat",
            scope: "user",
            email,
            password
        })
    }
    catch (e) {
        throw new Error(e as string)
    }
}
export default function SignIn() {
    const [email, setEmail] = createSignal("")
    const [password, setPassword] = createSignal("")
    const navigate = useNavigate()
    const handleSignIn = async () => {
        const token = await signIn(email(), password())
        if (!token) return
        sessionStorage.setItem("token", token)
        navigate("/")
    }
    return (
        <Center>
            <Card.Root width="sm" marginY={20}>
                <Card.Header>
                    <Card.Title>Sign In</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Stack gap={4}>
                        <Stack gap={1.5}>
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" placeholder="Email"
                                value={email()} onInput={e => setEmail(e.target.value)} />
                        </Stack>
                        <Stack gap="1.5">
                            <Label for="password">Password</Label>
                            <Input id="password" type="password" placeholder="Password"
                                value={password()} onInput={e => setPassword(e.target.value)} />
                        </Stack>
                    </Stack>
                </Card.Body>
                <Card.Footer>
                    <Button onClick={handleSignIn}>
                        Sign in
                    </Button>
                </Card.Footer>
            </Card.Root>
        </Center>
    )
}