import { Outlet, useParams } from "solid-start";
import { css } from "~/styled-system/css";
import { Text } from "~/components/ui/text";

export default function Index() {
    const { user } = useParams<{ user: string }>();
    
    return <div class={css({
        display:"flex",
        flexDirection:"column",
        height:"full"
    })}>
        <div class={css({flexShrink:0})}>
            <Text>ユーザー名: {decodeURIComponent(user)}</Text>

        </div>
        <div class={css({flexGrow:1})}>
            <Outlet />
        </div>
    </div>
}