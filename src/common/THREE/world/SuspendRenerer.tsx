import { JSX, use } from "react";

export default function SuspendRenerer<P extends object>({promise, Component}: {promise: Promise<P>, Component: (args: P) => JSX.Element}) {
    const args = use(promise);

    return Component(args)
}