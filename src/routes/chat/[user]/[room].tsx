import { For, Show, createEffect, createMemo, createResource, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { useParams } from "solid-start";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { css } from "~/styled-system/css";
import { Circle, Flex } from "~/styled-system/jsx";
import { Card } from "~/components/ui/card";

type Message = {
    id: string,
    content: string,
}

export default function Room() {
    // const db = useContext(SurrealContext)
    // const { room: _room, user: _user } = useParams<{ user: string, room: string }>();
    // const userName = createMemo(() => decodeURIComponent(_user))
    // const roomId = createMemo(() => decodeURIComponent(_room))

    // const [room] = createResource(async () => {
    //     const [r] = await db.select<{ id: string, name: string }>(roomId())
    //     return r
    // })
    // const [messages, setMessages] = createSignal<(Message & { poster: string, createdAt: Date, own?: boolean })[]>([])
    // const [uuid, setUuid] = createSignal<string>()

    // const [message, setMessage] = createSignal("")

    let rootRef: HTMLDivElement | undefined;
    let headerRef: HTMLDivElement | undefined;
    let footerRef: HTMLDivElement | undefined;
    const [rootHeight, setRootHeight] = createSignal(0)
    const [headerHeight, setHeaderHeight] = createSignal(0)
    const [footerHeight, setFooterHeight] = createSignal(0)

    createEffect(() => {
        console.log("rootHeight", rootHeight())
        console.log("headerHeight", headerHeight())
        console.log("footerHeight", footerHeight())
    })

    // onMount(async () => {
    //     if (rootRef && headerRef && footerRef) {
    //         rootRef.addEventListener("resize", () => {
    //             console.log("resize")
    //             if (!rootRef || !headerRef || !footerRef) return
    //             setRootHeight(rootRef.clientHeight)
    //             setHeaderHeight(headerRef.clientHeight)
    //             setFooterHeight(footerRef.clientHeight)
    //         })
    //         headerRef.addEventListener("resize", () => {
    //             console.log("resize")
    //             if (!rootRef || !headerRef || !footerRef) return
    //             setRootHeight(rootRef.clientHeight)
    //             setHeaderHeight(headerRef.clientHeight)
    //             setFooterHeight(footerRef.clientHeight)
    //         })
    //         footerRef.addEventListener("resize", () => {
    //             console.log("resize")
    //             if (!rootRef || !headerRef || !footerRef) return
    //             setRootHeight(rootRef.clientHeight)
    //             setHeaderHeight(headerRef.clientHeight)
    //             setFooterHeight(footerRef.clientHeight)
    //         })
    //     } else {
    //         console.log("refs is null")
    //     }
    //     const [[{ messages, posters, created }]] = await db.query(`
    //         SELECT 
    //         <-post<-message.* AS messages,
    //         <-post.poster AS posters,
    //         <-post.created_at AS created
    //         FROM $room;
    //     `, { room: roomId() }) as [[{
    //         messages: Message[],
    //         posters: string[]
    //         created: string[]
    //     }]]
    //     setMessages(messages.map((msg, i) => ({
    //         ...msg,
    //         poster: posters[i],
    //         createdAt: new Date(created[i])
    //     })))

    //     // LIVE SELECTでなぜかパラメータを渡すと正常に動かないのでクエリに直接埋め込む
    //     const [uuid] = await db.query(`
    //     LIVE SELECT 
    //     <-message.* as msg,
    //     poster,
    //     created_at 
    //     FROM post 
    //     WHERE array::all(array::matches(->room,${roomId()}));
    //     `) as [string]
    //     setUuid(uuid)

    //     db.listenLive<{ msg: Message[], poster: string, created_at: string }>(uuid, async ({ action, result, detail }) => {
    //         if (action === "CLOSE") return
    //         if (action === "CREATE") {
    //             setMessages(messages => [...messages, {
    //                 ...result.msg[0],
    //                 poster: result.poster,
    //                 createdAt: new Date(result.created_at),
    //                 own: result.poster === userName()
    //             }])
    //             return
    //         }
    //         if (action === "DELETE") {
    //             // resiltにpostのidが入っているためにここでは状態を更新できない、削除時に状態を更新する
    //             return
    //         }
    //     })
    // })
    // onCleanup(async () => {
    //     if (uuid()) await db.kill(uuid()!)
    // })

    return (
        // <Card.Root width="full" height="full" ref={rootRef} display="flex">
        //     <Card.Header ref={headerRef}>
        //         <Card.Title>{room()?.name}</Card.Title>
        //     </Card.Header>
        //     <Card.Body flexGrow="1">
        //         <div>
        //             <For each={messages().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())}>
        //                 {message => (
        //                     <Flex padding={"1"} alignItems="center" direction={message.own ? "row" : "row-reverse"} >
        //                         <Circle size="16" bg="gray.7">
        //                             <Text as="span" fontWeight="bold" color={message.own ? "red.10" : undefined} class={css({ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>{message.poster}</Text>
        //                         </Circle>

                                <span>
                                    <Text as="span">{message.content}</Text>
                                </span>
                                <Show when={message.own}>
                                    <Button size="xs" variant="ghost" color="red.11" shadowColor="red.light.12" onClick={async () => {
                                        await surreal.db.delete(message.id)
                                        setMessages(messages => messages.filter(msg => msg.id !== message.id))
                                    }}>削除</Button>
                                </Show>
                            </Flex>
                        )}
                    </For>
                </div>
            </Card.Body>
            <Card.Footer ref={footerRef}>
                <Input value={message()} onInput={e => setMessage(e.target.value)} />
                <Button onClick={async () => {
                    await surreal.db.query(`
                    LET $msg=(CREATE message SET content=$message RETURN id);
                    RELATE ($msg.id)->post->($room) SET poster=$poster,created_at=time::now();
                    `,
                        { message: message(), room: roomId(), poster: userName() }
                    )
                }
                }>送信</Button>
            </Card.Footer>
        </Card.Root>
    )
}