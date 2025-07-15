import UserScreen from "@/common/screen/UserScreen";
import { FlexCenter, Grid_Two } from "@/common/styledComponents";
import { CafeInfo } from "@/data/prisma-client";
import { Metadata } from "next";

import { redirectUrl } from "@/util/constants/app";
import Carousel from "@/common/image/Carousel";
import { fenxyYellowTransparency } from "@/util/constants/style";
import LinkCard from "./components/LinkCard";
import ThubmnailImage from "@/common/image/ThumbnailImage";
import NaverMap from "./components/NaverMap";

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
          alignSelf: 'center',
          padding: '2rem 0 4rem 0'
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
          aspectHeight={6}
        />
        <FlexCenter
          style={{
            marginTop: '6rem'
          }}
        >
          <span
            style={{
              fontSize: '4rem',
              fontWeight: 'bold'
            }}
          >
            {cafeInfo.name}
          </span>
          <span
            style={{
              fontSize: '2rem',
              paddingTop: '1rem'
            }}
          >
            {cafeInfo.address}
          </span>

        </FlexCenter>
        <FlexCenter
          style={{
            marginTop: '6rem',
            backgroundColor: fenxyYellowTransparency,
            borderRadius: '2rem 2rem 0 0',
            width: '100%',
            padding: '2rem 1rem'
          }}
        >
          <FlexCenter
            style={{
              width: '100%'
            }}
          >
            <span style={{ fontSize: '4rem', fontWeight: 600 }}>
              가상현실 카페 투어
            </span>
            <Grid_Two
              style={{
                width: '100%',
                marginTop: '2rem'
              }}
            >
              <LinkCard link={""} name={"제페토 월드"} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
              <LinkCard link={""} name={"제페토 월드"} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
            </Grid_Two>
            <Grid_Two
              style={{
                gap: '1rem',
                width: '100%',
                marginTop: '3rem'
              }}
            >
              <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
              <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
              <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
              <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
            </Grid_Two>

          </FlexCenter>
        </FlexCenter>
        <FlexCenter
          style={{
            width: '100%',
            marginTop: '6rem',
            padding: '1rem'
          }}
        >
          <span style={{ fontSize: '4rem', fontWeight: 600 }}>
            카페 사진
          </span>
          <Grid_Two
            style={{
              gap: '1rem',
              width: '100%',
              marginTop: '2rem'
            }}
          >
            <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
            <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
            <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
            <ThubmnailImage aspectHeight={300} aspectWidth={400} src={"https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"} />
          </Grid_Two>
        </FlexCenter>
        <FlexCenter
          style={{
            width: '100%',
            marginTop: '6rem',
            padding: '1rem'
          }}
        >
          <span style={{ fontSize: '4rem', fontWeight: 600 }}>
            찾아 오시는 길
          </span>
          <div
            style={{
              fontSize: '1.6rem',
              width: '100%',
              marginTop: '2rem'
            }}
          >
            <NaverMap
              width={'100%'}
              height={"30rem"}
              address={cafeInfo.address}
              zoom={18}
              title={cafeInfo.name}
            />
            <div style={{ textAlign: 'right' }}>
              {cafeInfo.address}
            </div>
            <div style={{ textAlign: 'right' }}>
              {cafeInfo.directions}
            </div>
          </div>
        </FlexCenter>

      </FlexCenter>
    </UserScreen>

  )
}

export default InfoDetailScreen;