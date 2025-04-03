// app/page.tsx

import { Metadata } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// --- BEGIN: Server-Side Frame Logic ---

/**
 * Function to construct the full base URL for the frame's post_url.
 * Uses VERCEL_URL env var on Vercel deployments.
 * You might need to set NEXT_PUBLIC_HOST_URL in your .env.local for local testing.
 * Example .env.local: NEXT_PUBLIC_HOST_URL="http://localhost:3000"
 */
function getHostUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_HOST_URL) {
    return process.env.NEXT_PUBLIC_HOST_URL;
  }
  // Default fallback for local development
  return 'http://localhost:3000';
}

// Define placeholder image URLs
const imageUrlInitial = 'https://placehold.co/600x400/000000/FFFFFF/png?text=Basic+Frame+State+1';
const imageUrlClicked = 'https://placehold.co/600x400/FFFFFF/000000/png?text=State+2+-+Clicked!';

/**
 * Generates the initial Frame Metadata that Farcaster clients (like Warpcast) read.
 */
export async function generateMetadata(): Promise<Metadata> {
  const postUrl = `${getHostUrl()}/`; // Post back to the same page ('/')

  const frameMetadata = {
    // Frame spec version
    'fc:frame': 'vNext',
    // Initial image
    'fc:frame:image': imageUrlInitial,
    // URL to send POST requests to when buttons are clicked
    'fc:frame:post_url': postUrl,
    // Button text
    'fc:frame:button:1': 'Click Me',
    // Add more buttons here if needed for the initial state
    // 'fc:frame:button:2': 'Button 2',
  };

  return {
    // Standard Open Graph metadata
    title: 'My Basic Frame',
    description: 'This is a minimal Farcaster frame example.',
    openGraph: {
      title: 'My Basic Frame',
      images: [imageUrlInitial], // og:image needed for previews
    },
    // Include frame metadata under "other"
    other: {
      ...frameMetadata,
    },
  };
}

/**
 * Handles the POST request sent by Farcaster clients when a frame button is clicked.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log("POST request received"); // Log when a request comes in

  // --- TODO: Add Frame Signature Packet validation ---
  // For now, this is insecure and assumes any POST is valid.
  // You should use libraries like `frog` or `@coinbase/onchainkit/frame`'s
  // `getFrameMessage` function here to validate the request body `req.json()`
  // before proceeding. Example (needs setup):
  // const body = await req.json();
  // const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'YOUR_NEYNAR_API_KEY' });
  // if (!isValid || !message) {
  //   return new NextResponse('Invalid Frame message', { status: 400 });
  // }
  // const buttonIndex = message.button; // Which button was clicked (1, 2, 3, 4)
  // const userFid = message.interactor.fid; // User's Farcaster ID
  // --------------------------------------------------

  // For this basic example, we'll just assume Button 1 was clicked
  // and return a new frame state indicating it was clicked.

  const postUrl = `${getHostUrl()}/`; // Post back to the same page

  // HTML response containing the *next* frame state
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

  // Return the HTML response
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

// --- END: Server-Side Frame Logic ---


// --- BEGIN: Client-Side Component Logic ---
// Ensure your existing client-side code (starting with "use client")
// is included below this line. Make sure paths to components/svg are correct.

"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { Name, Identity, Badge } from "@coinbase/onchainkit/identity";
import { useCallback, useEffect, useMemo, useState } from "react";
import Snake from "./components/snake"; // Make sure this path is correct
import { useAccount } from "wagmi";
import Check from "./svg/Check"; // Make sure this path is correct

const SCHEMA_UID =
  "0x7889a09fb295b0a0c63a3d7903c4f00f7896cca4fa64d2c1313f8547390b7d39";

// Make sure this is the default export
export default function App() {
  // --- PASTE YOUR ENTIRE EXISTING CLIENT-SIDE App FUNCTION CODE HERE ---
  // It should start with the useMiniKit hooks etc.
  // For example:
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const { address } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame, setFrameAdded]);

  const saveFrameButton = useMemo(() => {
      if (context && !context.client.added) {
          return (
              <button
              type="button"
              onClick={handleAddFrame}
              className="cursor-pointer bg-transparent font-semibold text-sm"
              >
              + SAVE FRAME
              </button>
          );
      }
      if (frameAdded) {
          return (
              <div className="flex items-center space-x-1 text-sm font-semibold animate-fade-out">
              <Check />
              <span>SAVED</span>
              </div>
          );
      }
    return null;
  }, [context, handleAddFrame, frameAdded]);

  return (
    <div className="flex flex-col min-h-screen sm:min-h-[820px] font-sans bg-[#E5E5E5] text-black items-center snake-dark relative">
      <div className="w-screen max-w-[520px]">
        <header className="mr-2 mt-1 flex justify-between">
            <div className="justify-start pl-1">
                {address ? (
                    <Identity address={address} schemaId={SCHEMA_UID} className="!bg-inherit p-0 [&>div]:space-x-2">
                        <Name className="text-inherit">
                            <Badge tooltip="High Scorer" className="!bg-inherit high-score-badge" />
                        </Name>
                    </Identity>
                ) : (
                    <div className="pl-2 pt-1 text-gray-500 text-sm font-semibold">NOT CONNECTED</div>
                )}
            </div>
            <div className="pr-1 justify-end">{saveFrameButton}</div>
        </header>
        <main className="font-serif">
          <Snake />
        </main>
        <footer className="absolute bottom-4 flex items-center w-screen max-w-[520px] justify-center">
            <button
            type="button"
            className="mt-4 ml-4 px-2 py-1 flex justify-start rounded-2xl font-semibold opacity-40 border border-black text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
            >
            BUILT ON BASE WITH MINIKIT
            </button>
        </footer>
      </div>
    </div>
  );
  // --- END OF YOUR CLIENT-SIDE App FUNCTION CODE ---
}

// --- END: Client-Side Component Logic ---
