export interface Vector2 {
  x: number
  y: number
};


export interface Vector3 {
  x: number
  y: number
  z: number
};

export interface Color {
  r?: number;
  g?: number;
  b?: number;
  a?: number;
};

const WHITE: Color = { r: 255, g: 255, b: 255, a: 255 };
const BLACK: Color = { r: 0, g: 0, b: 0, a: 255 };

const Vector3Lerp = (v1: Vector3, v2: Vector3, amount: number): Vector3 => {
  const result: Vector3 = { x: 0, y: 0, z: 0 };

  result.x = v1.x + amount * (v2.x - v1.x);
  result.y = v1.y + amount * (v2.y - v1.y);
  result.z = v1.z + amount * (v2.z - v1.z);

  return result;
}

const Vector3Add = (v1: Vector3, v2: Vector3): Vector3 => {
  const result: Vector3 = { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
  return result;
}

const Vector3Scale = (v: Vector3, scalar: number): Vector3 => {
  const result: Vector3 = { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
  return result;
}

const VecToCol = (input: Vector3): Color => {
  const out: Color = { r: (255 * input.x), g: (255 * input.y), b: (255 * input.z), a: 255 };
  return out;
}

// const ColToVec = (c: Color): Vector3 => {
//   const out: Vector3 = { x: c.r / 255.0, y: c.g / 255.0, z: c.b / 255.0 };
//   return out;
// }

export const Saturate = (input: Color, sat: number): Color => {
  if (Math.abs(sat) < 0.004) { return input; }  //Immediately return when sat is zero or so small no difference will result (less than 1/255)
  if ((input.r == 0) && (input.g == 0) && (input.b == 0)) { return input; }  //Prevents division by zero trying to saturate black

  let out: Color;
  let clerp: Vector3 = {
    x: input.r / 255.0, y: input.g / 255.0, z: input.b / 255.0
  };

  if (sat > 0.0) {
    let maxsat: Vector3;
    let mx: number = Math.max(Math.max(input.r, input.g), input.b);
    mx /= 255.0;
    maxsat = Vector3Scale(clerp, 1.0 / mx);
    clerp = Vector3Lerp(clerp, maxsat, sat);
  }

  if (sat < 0.0) {
    let grayc: Vector3;
    let avg: number = (input.r + input.g + input.b);
    avg /= (3.0 * 255.0);
    grayc = { x: avg, y: avg, z: avg };
    clerp = Vector3Lerp(clerp, grayc, -1.0 * sat);
  }
  out = { r: 255 * clerp.x, g: 255 * clerp.y, b: 255 * clerp.z, a: 255 };
  return out;
}

const ColorBlindTransform = (input: Color, CBtype: number): Color => {
  //Types 0=normal, 1=Protanopia, 2=Deuteranopia, 3=Tritanopia, 4=Achromatopsia
  //Matrices taken from https://gist.github.com/Lokno/df7c3bfdc9ad32558bb7

  let out: Color = BLACK;
  switch (CBtype) {
    case 0:
      return input;
    case 1:
      out.r = input.r * 0.567 + input.g * 0.433 + input.b * 0.000;
      out.g = input.r * 0.558 + input.g * 0.442 + input.b * 0.000;
      out.b = input.r * 0.000 + input.g * 0.242 + input.b * 0.758;
      return out;
    case 2:
      out.r = input.r * 0.625 + input.g * 0.375 + input.b * 0.000;
      out.g = input.r * 0.700 + input.g * 0.300 + input.b * 0.000;
      out.b = input.r * 0.000 + input.g * 0.300 + input.b * 0.700;
      return out;
    case 3:
      out.r = input.r * 0.950 + input.g * 0.050 + input.b * 0.000;
      out.g = input.r * 0.000 + input.g * 0.433 + input.b * 0.567;
      out.b = input.r * 0.000 + input.g * 0.475 + input.b * 0.525;
      return out;
    case 4:
      out.r = input.r * 0.299 + input.g * 0.587 + input.b * 0.114;
      out.g = input.r * 0.299 + input.g * 0.587 + input.b * 0.114;
      out.b = input.r * 0.299 + input.g * 0.587 + input.b * 0.114;
      return out;
    default:
      return input;
  }
}

export const Xform_RYB2RGB = (r: number, y: number, b: number): Color => {
  const rin: number = r / 255.0;
  const yin: number = y / 255.0;
  const bin: number = b / 255.0;


  //The values defined here are where the magic happens.  You can experiment with changing the values and see if you find a better set.  If so, notify me on GitHub @ProfJski !
  //I have included a few alternative sets below

  //RYB corners in RGB values
  //Values arranged to approximate an artist's color wheel
  let CG000: Vector3 = { x: 0.0, y: 0.0, z: 0.0 }; //Black
  let CG100: Vector3 = { x: 1.0, y: 0.0, z: 0.0 }; //Red
  let CG010: Vector3 = { x: 0.9, y: 0.9, z: 0.0 }; //Yellow = RGB Red+Green.  Still a bit high, but helps Yellow compete against Green.  Lower gives murky yellows.
  let CG001: Vector3 = { x: 0.0, y: 0.36, z: 1.0 }; //Blue: Green boost of 0.36 helps eliminate flatness of spectrum around pure Blue
  let CG011: Vector3 = { x: 0.0, y: 0.9, z: 0.2 }; //Green: A less intense green than {0,1,0}, which tends to dominate
  let CG110: Vector3 = { x: 1.0, y: 0.6, z: 0.0 }; //Orange = RGB full Red, 60% Green
  let CG101: Vector3 = { x: 0.6, y: 0.0, z: 1.0 }; //Purple = 60% Red, full Blue
  let CG111: Vector3 = { x: 1.0, y: 1.0, z: 1.0 }; //White

  /*
      //RYB corners in RGB values
      //Values arranged to approximate an artist's color wheel
      Vector3 CG000={0.0,0.0,0.0}; //Black
      Vector3 CG100={1.0,0.0,0.0}; //Red
      Vector3 CG010={0.9,0.9,0.0}; //Yellow = RGB Red+Green.  Still a bit high, but helps Yellow compete against Green.  Lower gives murky yellows.
      Vector3 CG001={0.0,0.36,1.0}; //Blue: Green boost of 0.36 helps eliminate flatness of spectrum around pure Blue
      Vector3 CG011={0.0,0.75,0.3}; //Green: A less intense green than {0,1,0}, which tends to dominate
      Vector3 CG110={1.0,0.6,0.0}; //Orange = RGB full Red, 60% Green
      Vector3 CG101={0.6,0.0,1.0}; //Purple = 60% Red, full Blue
      Vector3 CG111={1.0,1.0,1.0}; //White
  */
  /*
      //RYB corners in RGB values
      //Unbalanced corners: Less even hue distribution
      Vector3 CG000={0.0,0.0,0.0}; //Black
      Vector3 CG100={1.0,0.0,0.0}; //Red
      Vector3 CG010={1.0,1.0,0.0}; //Yellow
      Vector3 CG001={0.0,0.0,1.0}; //Blue:
      Vector3 CG011={0.0,1.0,0.0}; //Green:
      Vector3 CG110={1.0,0.5,0.0}; //Orange
      Vector3 CG101={0.5,0.0,1.0}; //Purple
      Vector3 CG111={1.0,1.0,1.0}; //White
  */

  //Trilinear interpolation from RYB to RGB
  let C00: Vector3
  let C01: Vector3
  let C10: Vector3
  let C11: Vector3;
  C00 = Vector3Add(Vector3Scale(CG000, 1.0 - rin), Vector3Scale(CG100, rin));
  C01 = Vector3Add(Vector3Scale(CG001, 1.0 - rin), Vector3Scale(CG101, rin));
  C10 = Vector3Add(Vector3Scale(CG010, 1.0 - rin), Vector3Scale(CG110, rin));
  C11 = Vector3Add(Vector3Scale(CG011, 1.0 - rin), Vector3Scale(CG111, rin));

  let C0: Vector3
  let C1: Vector3;
  C0 = Vector3Add(Vector3Scale(C00, 1.0 - yin), Vector3Scale(C10, yin));
  C1 = Vector3Add(Vector3Scale(C01, 1.0 - yin), Vector3Scale(C11, yin));

  let C: Vector3;
  C = Vector3Add(Vector3Scale(C0, 1.0 - bin), Vector3Scale(C1, bin));

  const CRGB: Color = { r: 255 * C.x, g: 255 * C.y, b: 255 * C.z, a: 255 };

  return CRGB;
}

export const Xform_RGB2RYB = (r: number, g: number, b: number): Color => {
  const rin: number = r / 255.0;
  const gin: number = g / 255.0;
  const bin: number = b / 255.0;

  //Finding the appropriate values for the inverse transform was no easy task.  After some experimentation, I wrote a separate program that used
  //the calculus of variations to help tweak my guesses towards values that provided a closer round-trip conversion from RGB to RYB to RGB again.

  //RGB corners in RYB values
  const CG000: Vector3 = { x: 0.0, y: 0.0, z: 0.0 }; //Black
  const CG100: Vector3 = { x: 0.891, y: 0.0, z: 0.0 }; //Red
  const CG010: Vector3 = { x: 0.0, y: 0.714, z: 0.374 }; //Green = RYB Yellow + Blue
  const CG001: Vector3 = { x: 0.07, y: 0.08, z: 0.893 }; //Blue:
  const CG011: Vector3 = { x: 0.0, y: 0.116, z: 0.313 }; //Cyan = RYB Green + Blue.  Very dark to make the rest of the function work correctly
  const CG110: Vector3 = { x: 0.0, y: 0.915, z: 0.0 }; //Yellow
  const CG101: Vector3 = { x: 0.554, y: 0.0, z: 0.1 }; //Magenta =RYB Red + Blue.  Likewise dark.
  const CG111: Vector3 = { x: 1.0, y: 1.0, z: 1.0 }; //White

  //Trilinear interpolation from RGB to RYB
  let C00: Vector3
  let C01: Vector3
  let C10: Vector3
  let C11: Vector3;

  C00 = Vector3Add(Vector3Scale(CG000, 1.0 - rin), Vector3Scale(CG100, rin));
  C01 = Vector3Add(Vector3Scale(CG001, 1.0 - rin), Vector3Scale(CG101, rin));
  C10 = Vector3Add(Vector3Scale(CG010, 1.0 - rin), Vector3Scale(CG110, rin));
  C11 = Vector3Add(Vector3Scale(CG011, 1.0 - rin), Vector3Scale(CG111, rin));

  let C0: Vector3
  let C1: Vector3;
  C0 = Vector3Add(Vector3Scale(C00, 1.0 - gin), Vector3Scale(C10, gin));
  C1 = Vector3Add(Vector3Scale(C01, 1.0 - gin), Vector3Scale(C11, gin));

  let C: Vector3;
  C = Vector3Add(Vector3Scale(C0, 1.0 - bin), Vector3Scale(C1, bin));

  const CRYB: Color = Saturate(VecToCol(C), 0.5);

  return CRYB;
}


const ColorMix = (a: Color, b: Color, blend: number): Color => {
  let out: Color;
  out.r = Math.sqrt((1.0 - blend) * (a.r * a.r) + blend * (b.r * b.r));
  out.g = Math.sqrt((1.0 - blend) * (a.g * a.g) + blend * (b.g * b.g));
  out.b = Math.sqrt((1.0 - blend) * (a.b * a.b) + blend * (b.b * b.b));
  out.a = (1.0 - blend) * a.a + blend * b.a;

  return out;
}

const ColorMixLin = (a: Color, b: Color, blend: number): Color => {
  let out: Color;
  out.r = (1.0 - blend) * a.r + blend * b.r;
  out.g = (1.0 - blend) * a.g + blend * b.g;
  out.b = (1.0 - blend) * a.b + blend * b.b;
  out.a = (1.0 - blend) * a.a + blend * b.a;

  return out;
}

const ColorInv = (input: Color): Color => {
  const out: Color = { r: 255 - input.r, g: 255 - input.g, b: 255 - input.b, a: 255 };
  return out;
}

export const Brighten = (input: Color, bright: number): Color => {
  if (bright == 0.0) { return input; }

  let out: Color;
  if (bright > 0.0) {
    out = ColorMix(input, WHITE, bright);
  }

  if (bright < 0.0) {
    out = ColorMix(input, BLACK, -1.0 * bright);
  }
  return out;
}


const ColorDistance = (a: Color, b: Color): number => {
  let out: number = ((a.r - b.r) * (a.r - b.r) + (a.g - b.g) * (a.g - b.g) + (a.b - b.b) * (a.b - b.b));
  out = Math.sqrt(out) / (Math.sqrt(3.0) * 255); //scale to 0-1
  return out;
}

export const ColorMixSub = (a: Color, b: Color, blend: number): Color => {
  let out: Color;
  let c: Color
  let d: Color
  let f: Color;

  c = ColorInv(a);
  d = ColorInv(b);

  f.r = Math.max(0, 255 - c.r - d.r);
  f.g = Math.max(0, 255 - c.g - d.g);
  f.b = Math.max(0, 255 - c.b - d.b);

  let cd: number = ColorDistance(a, b);
  cd = 4.0 * blend * (1.0 - blend) * cd;
  out = ColorMixLin(ColorMixLin(a, b, blend), f, cd);

  out.a = 255;
  return out;
}