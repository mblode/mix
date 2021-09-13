import React from "react";
import { map2 } from "./Mixer";
import { Brighten, Color, Saturate } from "./RYB";
import { Segment } from "./Segment";

export function ColorWheel() {
  let sat = 0
  let brightness = 0
  const segments: Color[] = []

  for (let i = 0; i < 360; i += 2) {
    let col = map2(i);
    col = Saturate(col, sat);
    col = Brighten(col, brightness);
    // DrawCircleSector(CircleCenter, 200, i, i + 5, 6, col);
    segments.push(col);
  }


  return (
    <div>
      {segments.map((col, i) => (
        <Segment key={i} color={col} />
      ))}
    </div>
  );
}