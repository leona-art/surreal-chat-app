import { A, useParams } from "@solidjs/router"
import { For, Show, createSignal, onCleanup, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { useNavigate } from "solid-start"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Dialog } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { db as surreal } from "~/root"
import { css } from "~/styled-system/css"
import { user } from "~/lib/user"

type Room = {
    id: string,
    name: string,
    created_at: Date,
    owner: string[],
    member: string[],
}
export default function Index() {
    const navigate = useNavigate()
    const [rooms, setRooms] = createSignal<Room[]>([])
    const [uuids, setUuids] = createSignal<string[]>([])
    const [roomName, setRoomName] = createSignal("")
    onMount(async () => {
        const db = surreal()
        if (!db) return
        const [rooms] = await await db.query<[Room[]]>("SELECT *,<-(join WHERE role=='owner')<-user.id as owner,<-(join WHERE role=='member')<-user.id as member FROM room")
        setRooms(rooms.map(room => ({ ...room, created_at: new Date(room.created_at) })))

        const [roomUuid] = await db.live<Room>("room", ({ action, result }) => {
            if (action === "CLOSE") return
            if (action === "CREATE") {
                setRooms(rooms => [...rooms, { ...result, created_at: new Date(result.created_at), owner: [] }])
                return
            }
            if (action === "DELETE") {
                setRooms(rooms => rooms.filter(room => room.id !== result as unknown as string))
                return
            }
        })

        const [ownerUuid] = await db.query<[string]>(`LIVE SELECT in as user,out as room FROM join WHERE role=='owner';`)
        await db.listenLive<{ user: string, room: string }>(ownerUuid, ({ action, result }) => {
            if (action === "CLOSE") return
            if (action === "CREATE") {
                setRooms(room => room.map(r => r.id === result.room ? { ...r, owner: [...r.owner, result.user] } : r))
                return
            }
        })
        setUuids(old => [...old, roomUuid, ownerUuid])

    })
    onCleanup(async () => {
        const db = surreal()
        if (!db) return
        await Promise.all(uuids().map(id => db.kill(id)))
    })
    const isOwner = (room: Room) => {
        if (!user.value) return false
        return room.owner.includes(user.value.id)
    }
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
                                <Button variant="solid" bgColor={isOwner(room) ? "blue.dark.6" : undefined}>
                                    {room.name}
                                </Button>
                            </Dialog.Trigger>
                            <Portal>
                                <Dialog.Backdrop/>
                                <Dialog.Positioner>
                                    <Dialog.Content>
                                        <Dialog.Title>ルーム名:{room.name}- {room.id}</Dialog.Title>
                                        <Show when={isOwner(room)}>
                                            <Dialog.CloseTrigger asChild>
                                                <Button bg="red.11" onClick={async () => {
                                                    const db = surreal()
                                                    if (!db) return
                                                    await db.delete(room.id)
                                                }}>削除</Button>
                                            </Dialog.CloseTrigger>
                                        </Show>
                                        <Dialog.CloseTrigger asChild>
                                            <Button>キャンセル</Button>
                                        </Dialog.CloseTrigger>
                                        <Dialog.CloseTrigger>
                                            <Button onClick={async () => {
                                                const db = surreal()
                                                if (!db) return
                                                try{
                                                    await db.query(`fn::join_room($auth.id,${room.id});`)
                                                    navigate(`./${room.id}`)
                                                }catch(e){
                                                    console.error(e)
                                                }
                                            }} >
                                                in
                                            </Button>
                                        </Dialog.CloseTrigger>
                                    </Dialog.Content>
                                </Dialog.Positioner>
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
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Title>ルーム作成</Dialog.Title>
                                <Input value={roomName()} onInput={e => setRoomName(e.target.value)} />
                                <Dialog.CloseTrigger asChild>
                                    <Button onClick={async () => {
                                        const db = surreal()
                                        if (!db) return
                                        try{
                                            const [room] = await db.create<Omit<Room, "id" | "owner"|"member">>("room", {
                                                name: roomName(),
                                                created_at: new Date(),
                                            })
                                            console.log(room)
                                        }catch(e){
                                            console.error(e)
                                        }
                                    }} disabled={roomName() === ""}>決定</Button>
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </Card.Footer>
        </Card.Root>


    </div>
}