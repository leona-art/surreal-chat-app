import { Outlet, useParams } from "solid-start";
import { css } from "~/styled-system/css";
import { Text } from "~/components/ui/text";
import { Flex } from "~/styled-system/jsx";

export default function Index() {
    const { user } = useParams<{ user: string }>();
    
    return <Flex direction="column" height="full">
        <div class={css({flexShrink:0})}>
            <Text>ユーザー名: {decodeURIComponent(user)}</Text>

        </div>
        <div class={css({flexGrow:1})}>
            <Outlet />
        </div>
    </Flex>
}