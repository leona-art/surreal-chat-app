import { For, createResource } from "solid-js"
import { db } from "~/routes/chat"

type Room = {
    id: string,
    name: string
}
export default function Index() {
    const [rooms, { refetch, mutate }] = createResource(async () => {
        return db.select<Room>("rooms")
    })
    return <div>
        <For each={rooms.latest}>
            {(room) => <div>{room.name}</div>}
        </For>
    </div>
}