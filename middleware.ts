// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Define all routes that should be publicly accessible
  // ALL OTHER ROUTES WILL BE PROTECTED automatically by Clerk
  publicRoutes: [
    "/", // Allow landing page
    "/sign-in(.*)", // Allow sign-in page and its sub-routes
    "/sign-up(.*)", // Allow sign-up page and its sub-routes
    // Add any other public paths like '/about', '/pricing', '/api/webhooks/stripe' here later if needed
  ],

  // You can optionally specify routes to ignore completely by Clerk (e.g., static assets handled differently)
  // ignoredRoutes: ["/api/webhooks/some_other_service"],
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks/ (allow specific API routes like webhooks to bypass auth if needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks/.*).*)',
    '/', // Match the root route as well
  ],
};