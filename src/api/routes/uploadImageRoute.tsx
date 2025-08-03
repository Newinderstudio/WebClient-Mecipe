import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // 파일을 바이트 배열로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일 이름 생성 (현재 시간 + 원본 파일명)
    const timestamp = Date.now();
    const originalName = file.name;
    const fileName = `${timestamp}-${originalName}`;

    // public 폴더 내 uploads 디렉토리에 저장
    const publicPath = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(publicPath, fileName);

    // 디렉토리가 없으면 생성
    await createUploadDirectory(publicPath);

    // 파일 저장
    await writeFile(filePath, buffer);

    // 클라이언트에서 접근 가능한 URL 반환
    const imageUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      imageUrl,
      success: true
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// uploads 디렉토리 생성 함수
async function createUploadDirectory(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
}

// API 라우트 설정
export const config = {
  api: {
    bodyParser: false, // formData를 직접 처리하기 위해 비활성화
  },
};