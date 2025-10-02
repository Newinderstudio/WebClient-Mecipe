import { use } from "react";
import { WorldRendererResult } from "../WorldRenderer";

export default function useWorldRenderer({ promiseForRendererOptions }: { promiseForRendererOptions: Promise<WorldRendererResult> }) {

    const result = use(promiseForRendererOptions);

    return {
        ...result,
    }
}