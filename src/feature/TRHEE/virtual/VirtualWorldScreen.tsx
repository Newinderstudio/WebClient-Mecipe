import { getMetaViewerSiteMap } from '@/util/get-meta-viewer-site-map';
import VirtualWorld from './components/VirtualWorld';

type PageParams = Awaited<ReturnType<typeof generateStaticParams>>[number]['params']['code'];

export async function generateStaticParams() {

    const siteMap = await getMetaViewerSiteMap()

    return siteMap.map((code) => ({
        params: {
            code
        }
    }))
}

export default async function VirtualWorldScreen(props: { params: Promise<PageParams> }) {

    console.log('VirtualWorldScreen', props);
    try {
        const { code } = await props.params;

        return <VirtualWorld worldCode={code} />;
    } catch (error) {
        console.error(error);

        throw error;
    }
}