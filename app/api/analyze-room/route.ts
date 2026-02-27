import { NextResponse } from "next/server";
import { normalizeModelData } from "../../../lib/normalizeModelData";
import type { RoomLayout } from "../../../lib/types";

// This is a placeholder "AI" endpoint that deterministically
// generates a reasonable bedroom layout based on the uploaded file size.
// It uses the golden example format (120" × 144" dorm) and converts it
// to our internal RoomLayout structure.

export const runtime = "edge";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a `files` field." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const fileEntries = formData
    .getAll("files")
    .filter((entry) => entry instanceof Blob) as Blob[];

  if (fileEntries.length === 0) {
    return NextResponse.json(
      { error: "Missing file upload." },
      { status: 400 },
    );
  }

  if (fileEntries.length > 5) {
    return NextResponse.json(
      { error: "Please upload up to 5 images per room." },
      { status: 400 },
    );
  }

  const tooLarge = fileEntries.find((file) => file.size > 10 * 1024 * 1024);
  if (tooLarge) {
    return NextResponse.json(
      { error: "Each file must be 10MB or smaller." },
      { status: 400 },
    );
  }

  const primaryFile = fileEntries[0];
  const size = primaryFile.size || 1;

  // Simple deterministic "randomness" from file size
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate layout matching golden example format (120" × 144" dorm)
  const width = 120;
  const depth = 144;

  // Golden example A: Accurate twin bed layout
  const goldenExample: any = {
    units: "in",
    room: {
      width,
      depth,
      height: 96,
      wallThickness: 6,
    },
    door: {
      wallIndex: 0,
      offsetFromLeft: width / 2, // 60
      width: 36,
      swing: "in_right",
    },
    fixedZones: [
      {
        type: "closet",
        x: 0,
        z: 0,
        width: 30,
        depth: 72,
      },
    ],
    furniture: [
      {
        type: "desk_standard",
        x: 12 + pseudoRandom(size) * 6, // slight variation
        z: 84 + pseudoRandom(size + 1) * 10,
        rotation: 90,
      },
      {
        type: "bed_twin",
        x: 40 + pseudoRandom(size + 2) * 10,
        z: 124.5 + pseudoRandom(size + 3) * 5,
        rotation: 90,
      },
      {
        type: "nightstand",
        x: 20 + pseudoRandom(size + 4) * 8,
        z: 120 + pseudoRandom(size + 5) * 8,
        rotation: 0,
      },
    ],
  };

  const normalized = normalizeModelData(goldenExample);

  return NextResponse.json({ layout: normalized });
}
