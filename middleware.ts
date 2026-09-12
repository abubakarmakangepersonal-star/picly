import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedExactRoutes = [
  "/home",
  "/explore",
  "/create",
  "/profile",
  "/marketplace",
  "/messages",
  "/settings",
];

const protectedPrefixRoutes = [
  "/profile/edit",
  "/profile/settings",
  "/messages/",
  "/settings/",
];

function isProtectedRoute(pathname: string) {
  if (protectedExactRoutes.includes(pathname)) {
    return true;
  }

  return protectedPrefixRoutes.some((route) =>
    pathname.startsWith(route),
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = isProtectedRoute(request.nextUrl.pathname);

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname,
    );

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/explore/:path*",
    "/create/:path*",
    "/profile/:path*",
    "/marketplace/:path*",
    "/messages/:path*",
    "/settings/:path*",
  ],
};