import { NextResponse } from "next/server";

export function createAuthenticationRequiredResponse() {
  return NextResponse.json(
    { message: "Authentication required." },
    { status: 401 },
  );
}
