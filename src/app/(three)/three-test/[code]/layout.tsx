import { ThreeContextProvider } from "@/store/THREE/store";

export default function VirtualWorldLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThreeContextProvider>
            {children}
        </ThreeContextProvider>
    );
}