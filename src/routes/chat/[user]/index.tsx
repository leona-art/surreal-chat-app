import { A } from "@solidjs/router"
import { For, createSignal, onCleanup, onMount, useContext } from "solid-js"
import { Portal } from "solid-js/web"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Dialog } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { db as surreal } from "~/root"
import { css } from "~/styled-system/css"

type Room = {
    id: string,
    name: string,
    created_at: Date
}
export default function Index() {
    return (
        <div>aaa</div>
    )
}