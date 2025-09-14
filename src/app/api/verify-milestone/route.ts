import { NextRequest, NextResponse } from "next/server";
import { ReclaimClient } from "@reclaimprotocol/zk-fetch";
import * as Reclaim from "@reclaimprotocol/js-sdk";
import { encodeAbiParameters } from "viem";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, castHash, expectedText } = body;

    if (!fid || !castHash || !expectedText) {
      return NextResponse.json(
        { error: "Missing required fields: fid, castHash, expectedText" },
        { status: 400 }
      );
    }

    // Step 1: Fetch cast data from NEYNAR API to verify text
    const neynarResponse = await fetch(
      `https://snapchain-api.neynar.com/v1/castById?hash=${castHash}&fid=${fid}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-api-key": process.env.NEYNAR_API_KEY || "",
        },
      }
    );

    if (!neynarResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch cast from NEYNAR API" },
        { status: 400 }
      );
    }

    const neynarData = await neynarResponse.json();
    const castText = neynarData.data?.castAddBody?.text;

    // Step 2: Verify cast text matches expected milestone text
    if (castText !== expectedText) {
      return NextResponse.json(
        {
          error: "Cast text does not match milestone text",
          expected: expectedText,
          actual: castText,
        },
        { status: 400 }
      );
    }

    // Step 3: Generate zkFetch proof using ReclaimClient
    const client = new ReclaimClient(
      process.env.RECLAIM_APP_ID!,
      process.env.RECLAIM_APP_SECRET!
    );

    const publicOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };

    const privateOptions = {
      headers: {
        "x-api-key": process.env.NEYNAR_API_KEY || "",
      },
    };

    const proof = await client.zkFetch(
      `https://snapchain-api.neynar.com/v1/castById?hash=${castHash}&fid=${fid}`,
      publicOptions,
      privateOptions
    );
    if (!proof) {
      return NextResponse.json(
        { error: "Failed to generate zkFetch proof" },
        { status: 500 }
      );
    }

    // Step 4: Transform proof for onchain use
    const onchainProof = Reclaim.transformForOnchain(proof);

    // Step 5: Encode proof as hex string using ABI encoding
    const encodedProof = encodeAbiParameters(
      [
        {
          type: "tuple",
          name: "proof",
          components: [
            {
              type: "tuple",
              name: "claimInfo",
              components: [
                { type: "string", name: "provider" },
                { type: "string", name: "parameters" },
                { type: "string", name: "context" },
              ],
            },
            {
              type: "tuple",
              name: "signedClaim",
              components: [
                {
                  type: "tuple",
                  name: "claim",
                  components: [
                    { type: "bytes32", name: "identifier" },
                    { type: "address", name: "owner" },
                    { type: "uint32", name: "timestampS" },
                    { type: "uint32", name: "epoch" },
                  ],
                },
                { type: "bytes[]", name: "signatures" },
              ],
            },
          ],
        },
      ],
      [onchainProof]
    );

    return NextResponse.json({
      success: true,
      castText,
      onchainProof: encodedProof,
    });
  } catch (error) {
    console.error("Error verifying milestone:", error);
    return NextResponse.json(
      { error: "Internal server error during milestone verification" },
      { status: 500 }
    );
  }
}
