// app/page.tsx

// Keep server-side imports
import { Metadata } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// Import the client component we just created
import PageClientComponent from './page.client'; // Adjust name if you changed it

// --- BEGIN: Server-Side Frame Logic ---

function getHostUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_HOST_URL) {
    return process.env.NEXT_PUBLIC_HOST_URL;
  }
  return 'http://localhost:3000';
}

const imageUrlInitial = 'https://placehold.co/600x400/000000/FFFFFF/png?text=Basic+Frame+State+1';
const imageUrlClicked = 'https://placehold.co/600x400/FFFFFF/000000/png?text=State+2+-+Clicked!';

export async function generateMetadata(): Promise<Metadata> {
  const postUrl = `${getHostUrl()}/`;
  const frameMetadata = {
    'fc:frame': 'vNext',
    'fc:frame:image': imageUrlInitial,
    'fc:frame:post_url': postUrl,
    'fc:frame:button:1': 'Click Me',
  };

  return {
    title: 'My Basic Frame',
    description: 'This is a minimal Farcaster frame example.',
    openGraph: {
      title: 'My Basic Frame',
      images: [imageUrlInitial],
    },
    other: {
      ...frameMetadata,
    },
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("POST request received");

  // TODO: Add Frame Signature Packet validation here later

  const postUrl = `${getHostUrl()}/`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Frame Clicked" />
        <meta property="og:image" content="${imageUrlClicked}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrlClicked}" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
        <meta property="fc:frame:button:1" content="Clicked!" />
      </head>
      <body>Frame State 2</body>
    </html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

// --- END: Server-Side Frame Logic ---

// --- Default export renders the Client Component ---
export default function Page() {
  // This Page component is now a Server Component.
  // It renders the Client Component we imported.
  return <PageClientComponent />;
}
