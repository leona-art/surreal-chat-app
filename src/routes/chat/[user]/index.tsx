import { onMount } from "solid-js"
import { useParams } from "solid-start"
import { Button } from "~/components/ui/button"
import { db as surreal } from "~/root"
type Message = {
    id: string,
    content: string,
}
export default function Index() {
    const { user } = useParams<{ user: string }>()
    onMount(async () => {
        const db = surreal()
        if (!db) return
        const [messages] = await db.query<[Message[]]>("SELECT <-posted_in<-message FROM $roomId", { roomId: user })
        console.log(messages)
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
    </div>
}