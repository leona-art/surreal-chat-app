// @refresh reload
import { Suspense, createSignal, onCleanup, onMount } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./root.css";
import { Surreal } from "surrealdb.js";

const db_ = createSignal<Surreal | null>(null);
export const db = db_[0];

export default function Root() {
  onMount(async () => {
    const db = new Surreal()
    await db.connect(import.meta.env.VITE_SURREAL_URL as string)
    .catch(e => {throw new Error(e as string)})
    db_[1](db)
  })
  onCleanup(async () => {
    if (!db()) return
    db()!.close()
  })
  return (
    <Html lang="ja">
      <Head>
        <Title>Surreal Chat APP</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta name="description" content="Surreal Chat App" />
      </Head>
      <Body>
        <Suspense fallback={<>Loading...</>}>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
