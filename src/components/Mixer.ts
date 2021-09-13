import { Color, Vector3, Xform_RYB2RGB } from "./RYB";

const step2 = (deg: number): number => {
  let out: number = 0.0;
  let sc: number = 0.0;
  while (deg < 0.0) { deg += 360.0; }
  while (deg > 360.0) { deg -= 360.0; }

  if (deg <= 60.0) {
    out = 1.0;
  }
  else if ((deg > 60.0) && (deg <= 120.0)) {
    sc = (deg - 60.0) / 60.0;
    out = 1.0 - 2.0 * sc / Math.sqrt(1.0 + 3.0 * sc * sc);
  }
  else if ((deg > 120.0) && (deg <= 240.0)) {
    out = 0.0;
  }
  else if ((deg > 240.0) && (deg <= 300.0)) {
    sc = (deg - 240.0) / 60.0;
    out = 2.0 * sc / Math.sqrt(1.0 + 3.0 * sc * sc);
  }
  else if ((deg > 300.0) && (deg <= 360.0)) {
    out = 1.0;
  }

  return out;
}

export const map2 = (deg: number): Color => {
  let out: Vector3 = {
    x: 255 * step2(deg),
    y: 255 * step2(deg - 120),
    z: 255 * step2(deg - 240)
  };

  let output: Color = Xform_RYB2RGB(out.x, out.y, out.z);

  return output;
}