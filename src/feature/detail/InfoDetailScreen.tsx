import UserScreen from "@/common/screen/UserScreen";
import { FlexCenter } from "@/common/styledComponents";
import { CafeInfo } from "@/data/prisma-client";
import { Metadata } from "next";

import { redirectUrl } from "@/util/constants/app";
import Carousel from "@/common/image/Carousel";

type PageParams = Awaited<ReturnType<typeof generateStaticParams>>[number]


export async function generateStaticParams() {
  const res = await fetch(redirectUrl + "/api/test/info/ids");
  const infoIds: number[] = await res.json();

  const paths = infoIds.map((id) => ({ id: id.toString() }))

  return paths;

}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { id } = await params
  const res = await fetch(redirectUrl + `/api/test/info/${id}`)
  const cafeInfo: CafeInfo = await res.json()

  if (!cafeInfo) {
    return { title: 'Info Not Found' }
  }

  return { title: cafeInfo.name }
}

async function InfoDetailScreen(props: { params: Promise<PageParams> }) {

  const { id } = await props.params;

  const res = await fetch(`${redirectUrl}/api/test/info/${id}`)
  const cafeInfo: CafeInfo = await res.json();

  console.log(id);

  return (
    <UserScreen
      headerOverlap={false}
      backSpace={true}
      fullScreen={false}
      navigationList={[{ name: cafeInfo.name, routerUrl: "" }]}
    >
      <FlexCenter
        style={{
          maxWidth: 768,
          alignSelf: 'center'
        }}
      >
        <Carousel
          images={[
            "https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png",
            "https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png",
            "https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png",
            "https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"
          ]}
          interval={5000}
          aspectWidth={16}
          aspectHeight={8}
          style={{
            marginTop: 20,
          }}
        />
        <FlexCenter
          style={{
            marginTop:120
          }}
        >
          {cafeInfo.name}
        </FlexCenter>

      </FlexCenter>
    </UserScreen>

  )
}

export default InfoDetailScreen;