import { Outlet, useParams } from "solid-start";

export default function Index() {
    const { user } = useParams<{ user: string }>();
    return <div>
        {user}としてログインしています
        <Outlet />
    </div>
}