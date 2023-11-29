import { createStore } from "solid-js/store"

export type User = {
    id: string,
    name: string
    email: string
    createdAt: Date
}
export const [user, setUser] = createStore<{ value?: User }>({})