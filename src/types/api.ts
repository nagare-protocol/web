import { NextResponse } from "next/server";

export type ApiReturnType<API extends (...args: unknown[]) => unknown> =
  Awaited<ReturnType<API>> extends NextResponse<infer T> ? T : never;
