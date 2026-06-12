import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function fail(error: any, status = 400) {
  return NextResponse.json({ data: null, error }, { status });
}
