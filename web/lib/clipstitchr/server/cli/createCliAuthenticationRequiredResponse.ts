import { NextResponse } from "next/server";

export function createCliAuthenticationRequiredResponse() {
  return NextResponse.json(
    { message: "Run `clipstitchr login` to connect this machine." },
    { status: 401 },
  );
}
