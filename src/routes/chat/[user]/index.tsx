import { For, createEffect, createResource, useContext } from "solid-js"
import { Surreal } from "surrealdb.js"
import { Button } from "~/components/ui/button"
import { connection } from "~/routes/chat"

type Room = {
    id: string,
    name: string
}
export default function Index() {
    const [rooms, { refetch, mutate }] = createResource( async () => {
        const _connection=connection()
        if (_connection.state === "connected") {
            return _connection.db.select<Room>("room")
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