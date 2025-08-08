import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // 요청 URL 정보 가져오기
    const url = new URL(request.url);
    
    // 호스트 정보 분석
    const hostname = url.hostname;
    const protocol = url.protocol;
    const port = url.port;
    
    // localhost 여부 확인
    const isLocalhost = hostname === 'localhost' || 
                       hostname === '127.0.0.1' || 
                       hostname.startsWith('192.168.') ||
                       hostname.startsWith('10.') ||
                       hostname.startsWith('172.');
    
    // HTTP/HTTPS 여부 확인
    const isHttp = protocol === 'http:';
    const isHttps = protocol === 'https:';
    
    // 개발 환경 여부 확인 (일반적으로 localhost + 특정 포트는 개발 환경)
    const isDevelopment = isLocalhost && (port === '3000' || port === '3001' || port === '8080' || port === '');
    
    const serverInfo = {
      hostname: hostname,
      protocol: protocol,
      port: port || 'default',
      fullUrl: url.toString(),
      isLocalhost: isLocalhost,
      isHttp: isHttp,
      isHttps: isHttps,
      isDevelopment: isDevelopment,
      environment: isDevelopment ? 'development' : (isLocalhost ? 'local' : 'production'),
      headers: {
        host: request.headers.get('host'),
        'user-agent': request.headers.get('user-agent'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
        'x-forwarded-host': request.headers.get('x-forwarded-host'),
      }
    };
    
    return NextResponse.json({
      success: true,
      data: serverInfo,
      message: '서버 URL 정보를 성공적으로 가져왔습니다.'
    });
    
  } catch (error) {
    console.error('서버 URL 정보 가져오기 실패:', error);
    return NextResponse.json({
      success: false,
      error: '서버 URL 정보를 가져오는 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}