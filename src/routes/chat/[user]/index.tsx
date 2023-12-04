import { For, createSignal, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { useParams } from "solid-start"
import { Button } from "~/components/ui/button"
import { db as surreal } from "~/root"
type User = {
    id: string,
    name: string,
}
type Message = {
    id: string,
    content: string,
    createdAt: Date,
    user: User
}
type Raw<T> = Omit<T, "createdAt" | "user"> & { created_at: string } & { user: User[] }

function parseMessage(message: Raw<Message>): Message {
    return {
        ...message,
        createdAt: new Date(message.created_at),
        user: message.user[0]
    }
}
export default function Index() {
    const { user } = useParams<{ user: string }>()
    const [messages, setMessages] = createStore<Message[]>([])
    onMount(async () => {
        const db = surreal()
        if (!db) return
        const [_, messages] = await db.query<[null, Raw<Message>[]]>(`
        LET $msgs=SELECT VALUE <-posted_in<-message FROM $room;
        FOR $msg IN $msgs {
            LET $res=SELECT <-posts<-user.* AS user,created_at,content FROM $msg;
            RETURN $res;
        };
        `, { room: user })
        setMessages(messages.map(parseMessage))

        // LIVE SELECTでなぜかパラメータを渡すと正常に動かないのでクエリに直接埋め込む
        const [uuid] = await db.query<[string]>(`
        LIVE SELECT <-posted_in<-message FROM $message WHERE ->posted_in->room CONTAINS ${user};
        `)
        await db.listenLive<Raw<Message>>(uuid, ({ action, result }) => {
            if (action === "CLOSE") return
            if (action === "CREATE") {
                console.log(result)
                return
            }
        })
    })
    return <div>
        {user}
        <Button
            onClick={async () => {
                const db = surreal()
                if (!db) return
                await db.query(
                    `LET $msg=(CREATE message SET content=$content RETURN id);
                    RELATE ($auth.id)->posts->($msg.id);
                    RELATE ($msg.id)->posted_in->($roomId);`,
                    { content: "hello", roomId: user })
            }}
        >add</Button>

        <For each={messages}>
            {message => <div>{message.user.name}: {message.content}</div>}
        </For>
    </div>
}