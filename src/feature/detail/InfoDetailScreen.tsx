import UserScreen from "@/common/screen/UserScreen";
import { FlexCenter, Grid_Two } from "@/common/styledComponents";
import { CafeInfo } from "@/data/prisma-client";
import { Metadata } from "next";

import { redirectUrl, rootUrl } from "@/util/constants/app";
import Carousel from "@/common/image/Carousel";
import { fenxyYellowTransparency } from "@/util/constants/style";
import LinkCard from "./components/LinkCard";
import ThubmnailImage from "@/common/image/ThumbnailImage";
import NaverMap from "./components/NaverMap";
import { getServerImage } from "@/util/fetchImage";
import { getShortRegionCategoryNameById } from "@/api/regionCategoriesApi";

type PageParams = Awaited<ReturnType<typeof generateStaticParams>>[number]


export async function generateStaticParams() {
  const res = await fetch(rootUrl + "/places/ids");

  if(res.ok === false) {
    return [];
  }

  const infoIds: {id:number}[] = await res.json();

  const paths = infoIds.map(({id}) => ({ id: id.toString() }))

  return paths;

}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { id } = await params
  const res = await fetch(rootUrl + `/places/${id}`);
  const cafeInfo: CafeInfo = await res.json()

  if (!cafeInfo) {
    return { title: 'Info Not Found' }
  }

  return { 
    title: `${cafeInfo.name}: 메시피 가상현실 투어`, 
    description: `장소명: ${cafeInfo.name}, 주소: ${cafeInfo.address}, 오시는길: ${cafeInfo.directions}, 가상현실 카페 투어, 메시피`, 
    openGraph: {
      title: "메시피 가상현실 투어: "+ cafeInfo.name,
      description: `매력적인 ${cafeInfo.name}(으)로!`,
      url: redirectUrl + `/detail/${cafeInfo.id}`,
      images: {
        url: cafeInfo.CafeThumbnailImages && cafeInfo.CafeThumbnailImages?.length > 0? new URL(getServerImage(cafeInfo.CafeThumbnailImages[0].url)) : "",
        width: 1200,
        height: 630,
        alt: cafeInfo.name
      }
    }
  }
}

async function InfoDetailScreen(props: { params: Promise<PageParams> }) {

  const { id } = await props.params;

  const res = await fetch(rootUrl + `/places/${id}`);
  const cafeInfo: CafeInfo = await res.json();

  const ancestorCategoriesRes = await fetch(rootUrl + `/regioncategories/ancestor/${cafeInfo.regionCategoryId}`);
  const ancestorCategories = await ancestorCategoriesRes.json();

  const shortCategoriesName = getShortRegionCategoryNameById(cafeInfo.regionCategoryId, ancestorCategories);

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
          images={cafeInfo.CafeThumbnailImages?.map((image) => getServerImage(image.url)) ?? []}
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
            {shortCategoriesName}
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
              {
                cafeInfo.CafeVirtualLinks?.filter((link) => link.type === 'ZEPETO' || link.type === 'WEB_VIEWER').map((link, index) => {
                  return <LinkCard
                    key={index}
                    link={link.url}
                    name={link.name}
                    isAvaliable={link.isAvaliable}
                    src={link.CafeVirtualLinkThumbnailImage?.url ? getServerImage(link.CafeVirtualLinkThumbnailImage.url) : ""}
                  />
                })
              }
            </Grid_Two>
            <Grid_Two
              style={{
                gap: '1rem',
                width: '100%',
                marginTop: '3rem'
              }}
            >
              {
                cafeInfo.CafeVirtualImages?.map((image, index) => (
                  <ThubmnailImage
                    key={index}
                    aspectHeight={300}
                    aspectWidth={400}
                    src={getServerImage(image.url)}
                  />
                ))
              }
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
            {
              cafeInfo.CafeRealImages?.map((image, index) => (
                <ThubmnailImage
                  key={index}
                  aspectHeight={300}
                  aspectWidth={400}
                  src={getServerImage(image.url)}
                />
              ))
            }
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