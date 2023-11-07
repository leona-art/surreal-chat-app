import { useParams } from "solid-start";

export default function Room() {
    const { room, user } = useParams<{ user: string, room: string }>();
    return <div>
        {user}- {room}
    </div>;
}