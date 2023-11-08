import { For, createEffect, createResource, useContext } from "solid-js"
import { Surreal } from "surrealdb.js"
import { Button } from "~/components/ui/button"
import { surreal } from "~/routes/chat"

type Room = {
    id: string,
    name: string
}
export default function Index() {
    const [rooms, { refetch, mutate }] = createResource( async () => {
        if (surreal.connection === "connected") {
            return surreal.db.select<Room>("room")
        }else{
            return []
        }
    })
    return <div>
        <For each={rooms()}>
            {(room) => <div>{room.name}</div>}
        </For>

    </div>
}