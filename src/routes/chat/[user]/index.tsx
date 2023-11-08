import { A } from "@solidjs/router"
import { For, createResource, createSignal, onCleanup, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Dialog } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { surreal } from "~/root"
import { css } from "~/styled-system/css"

type Room = {
    id: string,
    name: string,
    created_at: Date
}
export default function Index() {
    const [rooms, setRooms] = createSignal<Room[]>([])
    const [uuid, setUuid] = createSignal<string>()
    const [roomName, setRoomName] = createSignal("")
    onMount(async () => {
        const rooms = await surreal.db.select<Room>("room")
        setRooms(rooms.map(room => ({ ...room, created_at: new Date(room.created_at) })))
        const uuid = await surreal.db.live<Room>("room", ({ action, result }) => {
            if (action === "CLOSE") return
            if (action === "CREATE") {
                setRooms(rooms => [...rooms, { ...result, created_at: new Date(result.created_at) }])
                return
            }
            if (action === "DELETE") {
                setRooms(rooms => rooms.filter(room => room.id !== result as unknown as string))
                return
            }
        })
        setUuid(uuid)
    })
    onCleanup(async () => {
        if (uuid()) await surreal.db.kill(uuid()!)
    })
    return <div class={css({
        padding: "12",
    })}>
        <Card.Root>
            <Card.Header>
                <Card.Title>入室先を選択してください</Card.Title>
            </Card.Header>
            <Card.Body>
                <For each={rooms()}>
                    {room => (
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <Button variant="solid">
                                    {room.name}
                                </Button>
                            </Dialog.Trigger>
                            <Portal>
                                <Dialog.Backdrop />
                                <Dialog.Container>
                                    <Dialog.Content>
                                        <Dialog.Title>ルーム名:{room.name}</Dialog.Title>
                                        <Dialog.CloseTrigger asChild>
                                            <Button bg="red.11" onClick={async () => {
                                                await surreal.db.delete(room.id)
                                            }}>削除</Button>
                                        </Dialog.CloseTrigger>
                                        <Dialog.CloseTrigger asChild>
                                            <Button>キャンセル</Button>
                                        </Dialog.CloseTrigger>
                                        <Dialog.CloseTrigger asChild>
                                            <Button asChild >
                                                <A href={`./${room.id}`}>入室</A>
                                            </Button>
                                        </Dialog.CloseTrigger>
                                    </Dialog.Content>
                                </Dialog.Container>
                            </Portal>
                        </Dialog.Root>
                    )}
                </For>
            </Card.Body>
            <Card.Footer>
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <Button>作成</Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Container>
                            <Dialog.Content>
                                <Dialog.Title>ルーム作成</Dialog.Title>
                                <Input value={roomName()} onInput={e => setRoomName(e.target.value)} />
                                <Dialog.CloseTrigger asChild>
                                    <Button onClick={async () => {
                                        const [room] = await surreal.db.create<Omit<Room, "id">>("room", {
                                            name: roomName(),
                                            created_at: new Date()
                                        })
                                    }} disabled={roomName() === ""}>決定</Button>
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Container>
                    </Portal>
                </Dialog.Root>
            </Card.Footer>
        </Card.Root>


    </div>
}