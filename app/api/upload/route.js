// app/api/upload/route.js
import { NextRequest, NextResponse } from 'next/server';

import { fileService, upload, fileUtils } from '../../../lib/file-service';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const options = {
      folder: formData.get('folder') || 'general',
      processImage: formData.get('processImage') !== 'false'
    };

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        // Convert File to buffer for processing
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileObj = {
          originalname: file.name,
          mimetype: file.type,
          size: file.size,
          buffer: buffer
        };

        const result = await fileService.uploadFile(fileObj, options);
        results.push({
          originalName: file.name,
          ...result
        });
      } catch (error) {
        errors.push({
          fileName: file.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `${results.length} files uploaded successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    // console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');
    const type = searchParams.get('type') || 'file';

    if (!identifier) {
      return NextResponse.json(
        { error: 'File identifier required' },
        { status: 400 }
      );
    }

    const result = await fileService.deleteFile(identifier);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      provider: result.provider
    });
  } catch (error) {
    // console.error('❌ Delete API error:', error);
    return NextResponse.json(
      { error: 'Delete failed', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'File identifier required' },
        { status: 400 }
      );
    }

    const result = await fileService.getFileInfo(identifier);

    return NextResponse.json({
      success: true,
      file: result
    });
  } catch (error) {
    // console.error('❌ File info API error:', error);
    return NextResponse.json(
      { error: 'Failed to get file info', message: error.message },
      { status: 500 }
    );
  }
}
