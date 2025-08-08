import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 클라이언트가 요청을 보낸 URL 정보 가져오기
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const userAgent = request.headers.get('user-agent');
    
    // 모든 헤더 정보를 로깅하여 디버깅
    const allHeaders: Record<string, string | null> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    
    // Referer URL 파싱 (클라이언트가 요청을 보낸 페이지 URL)
    let clientUrl = null;
    let clientUrlInfo = null;
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        clientUrl = referer;
        clientUrlInfo = {
          hostname: refererUrl.hostname,
          protocol: refererUrl.protocol,
          port: refererUrl.port || 'default',
          pathname: refererUrl.pathname,
          search: refererUrl.search,
          hash: refererUrl.hash,
          fullUrl: refererUrl.toString(),
          isLocalhost: refererUrl.hostname === 'localhost' || 
                      refererUrl.hostname === '127.0.0.1' || 
                      refererUrl.hostname.startsWith('192.168.') ||
                      refererUrl.hostname.startsWith('10.') ||
                      refererUrl.hostname.startsWith('172.'),
          isHttp: refererUrl.protocol === 'http:',
          isHttps: refererUrl.protocol === 'https:'
        };
      } catch (error) {
        console.warn('Referer URL 파싱 실패:', error);
      }
    }
    
    // Origin URL 파싱 (클라이언트의 출처)
    let originUrlInfo = null;
    if (origin) {
      try {
        const originUrl = new URL(origin);
        originUrlInfo = {
          hostname: originUrl.hostname,
          protocol: originUrl.protocol,
          port: originUrl.port || 'default',
          fullUrl: originUrl.toString(),
          isLocalhost: originUrl.hostname === 'localhost' || 
                      originUrl.hostname === '127.0.0.1' || 
                      originUrl.hostname.startsWith('192.168.') ||
                      originUrl.hostname.startsWith('10.') ||
                      originUrl.hostname.startsWith('172.'),
          isHttp: originUrl.protocol === 'http:',
          isHttps: originUrl.protocol === 'https:'
        };
      } catch (error) {
        console.warn('Origin URL 파싱 실패:', error);
      }
    }
    
    // 대안적인 방법: Host 헤더를 기반으로 정보 추출
    let hostInfo = null;
    if (host) {
      try {
        // Host 헤더는 보통 "hostname:port" 형태
        const [hostname, port] = host.split(':');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        
        hostInfo = {
          hostname: hostname,
          protocol: `${protocol}:`,
          port: port || 'default',
          fullUrl: `${protocol}://${host}`,
          isLocalhost: hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.startsWith('192.168.') ||
                      hostname.startsWith('10.') ||
                      hostname.startsWith('172.'),
          isHttp: protocol === 'http',
          isHttps: protocol === 'https'
        };
      } catch (error) {
        console.warn('Host 정보 파싱 실패:', error);
      }
    }
    
    const clientInfo = {
      referer: referer,
      origin: origin,
      host: host,
      clientUrl: clientUrl,
      clientUrlInfo: clientUrlInfo,
      originUrlInfo: originUrlInfo,
      hostInfo: hostInfo,
      allHeaders: allHeaders,
      debug: {
        hasReferer: !!referer,
        hasOrigin: !!origin,
        hasHost: !!host,
        refererLength: referer ? referer.length : 0,
        originLength: origin ? origin.length : 0,
        userAgent: userAgent
      }
    };
    
    return NextResponse.json({
      success: true,
      data: clientInfo,
      message: '클라이언트 요청 URL 정보를 성공적으로 가져왔습니다.'
    });
    
  } catch (error) {
    console.error('클라이언트 URL 정보 가져오기 실패:', error);
    return NextResponse.json({
      success: false,
      error: '클라이언트 URL 정보를 가져오는 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}