import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { useParams } from "solid-start"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { db as surreal } from "~/root"
import { css } from "~/styled-system/css"
import { Center, Flex, Stack } from "~/styled-system/jsx"
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
    const { user: room } = useParams<{ user: string }>()
    const [messages, setMessages] = createStore<Message[]>([])
    const list = createMemo(() => [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
    const [uuid, setUuid] = createSignal<string>()
    const [message, setMessage] = createSignal("")
    onMount(async () => {
        const db = surreal()
        if (!db) return
        const [_, messages] = await db.query<[null, Raw<Message>[]]>(`
        LET $msgs=SELECT VALUE <-posted_in<-message FROM $room;
        FOR $msg IN $msgs {
            LET $res=SELECT <-posts<-user.* AS user,created_at,content FROM $msg;
            RETURN $res;
        };
        `, { room: room })
        console.log(messages)
        setMessages(messages.map(parseMessage))

        // // LIVE SELECTでなぜかパラメータを渡すと正常に動かないのでクエリに直接埋め込む
        const [uuid] = await db.query<[string]>(`
        LIVE SELECT 
        <-message.* as msg,
        <-message<-posts<-user.* as user 
        FROM posted_in WHERE (->room CONTAINS ${room});
        `)

        await db.listenLive<{ msg: [Omit<Raw<Message>, "user">], user: [User] }>(uuid, ({ action, result }) => {
            if (action === "CLOSE") return
            if (action === "CREATE") {
                const { msg: [msg], user } = result
                setMessages(messages => [...messages, parseMessage({ ...msg, user, })])
                return
            }
        })
        setUuid(uuid)
    })
    onCleanup(async () => {
        const db = surreal()
        const id = uuid()
        if (!db || !id) return
        await db.kill(id)
    })
    const sendMessage = async () => {
        const db = surreal()
        if (!db) return
        try {
            await db.query<[Raw<Message>]>(`
            BEGIN TRANSACTION;
            LET $msg=(CREATE message SET content=$content RETURN id);
            RELATE ($auth.id)->posts->($msg.id);
            RELATE ($msg.id)->posted_in->($room);
            COMMIT TRANSACTION;
            `, { content: message(), room: room })
            setMessage("")
        } catch (e) {
            console.error(e)
        }
    }
    return <Flex direction="column" height="full">
        <Stack gap={2} overflow="hidden" flexGrow={1}>
            <For each={list()}>
                {message => <div>{message.user.name}:{message.content}</div>}
            </For>
        </Stack>
        <Stack position="sticky" bottom={0} gap={0} bg="white" flexShrink={0}>
            <Textarea borderBottomRadius={0}
            value={message()} onInput={e => setMessage(e.target.value)} onKeyDown={e => {
                if (e.key === "Enter"&&e.shiftKey) {
                    sendMessage()
                }
            }} />

            <Button width="full" disabled={message() === ""} borderTopRadius={0}
                onClick={sendMessage}
            >Send</Button>
        </Stack>
    </Flex>
}

