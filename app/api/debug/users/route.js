import { NextResponse } from 'next/server';

import { users } from '../../../../lib/shared-auth';

export async function GET() {
  try {
    const userList = Array.from(users.values());
    return NextResponse.json({
      success: true,
      users: userList,
      count: users.size
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
