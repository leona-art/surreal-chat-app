// @refresh reload
import { Suspense, onCleanup } from "solid-js";
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
import { createStore } from "solid-js/store";

export const [surreal,setSurreal]=createStore<{db:Surreal,connection:"yet"|"connected"|"error"}>({
  db:new Surreal(),
  connection:"yet"
})

export default function Root() {
  onCleanup(async()=>[
    await surreal.db.close()
  ])
  return (
    <Html lang="ja">
      <Head>
        <Title>Surreal Chat APP</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta name="description" content="Surreal Chat App" />
      </Head>
      <Body>
        <Suspense>
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
