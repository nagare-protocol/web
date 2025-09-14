import { NextResponse } from "next/server";

// No necessary to avoid any type here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiReturnType<API extends (...args: any[]) => any> = Awaited<
  ReturnType<API>
> extends NextResponse<infer T>
  ? T
  : never;
