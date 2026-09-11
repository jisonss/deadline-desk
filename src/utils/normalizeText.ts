/**
 * Pasted class announcements are usually written with Unicode "fancy" letters
 * (𝐁𝐎𝐋𝐃, 𝗦𝗔𝗡𝗦, ｆｕｌｌｗｉｄｔｈ). Those are separate codepoints, so any keyword
 * matching has to run on ASCII-folded text first.
 */

type Range = [start: number, end: number, asciiStart: number]

const RANGES: Range[] = [
  [0x1d400, 0x1d419, 0x41], // bold
  [0x1d41a, 0x1d433, 0x61],
  [0x1d434, 0x1d44d, 0x41], // italic
  [0x1d44e, 0x1d467, 0x61],
  [0x1d468, 0x1d481, 0x41], // bold italic
  [0x1d482, 0x1d49b, 0x61],
  [0x1d5a0, 0x1d5b9, 0x41], // sans-serif
  [0x1d5ba, 0x1d5d3, 0x61],
  [0x1d5d4, 0x1d5ed, 0x41], // sans-serif bold
  [0x1d5ee, 0x1d607, 0x61],
  [0x1d608, 0x1d621, 0x41], // sans-serif italic
  [0x1d622, 0x1d63b, 0x61],
  [0x1d63c, 0x1d655, 0x41], // sans-serif bold italic
  [0x1d656, 0x1d66f, 0x61],
  [0x1d670, 0x1d689, 0x41], // monospace
  [0x1d68a, 0x1d6a3, 0x61],
  [0x1d504, 0x1d51d, 0x41], // fraktur
  [0x1d51e, 0x1d537, 0x61],
  [0x1d538, 0x1d551, 0x41], // double-struck
  [0x1d552, 0x1d56b, 0x61],
  [0x1d7ce, 0x1d7d7, 0x30], // bold digits
  [0x1d7d8, 0x1d7e1, 0x30], // double-struck digits
  [0x1d7e2, 0x1d7eb, 0x30], // sans digits
  [0x1d7ec, 0x1d7f5, 0x30], // sans bold digits
  [0xff21, 0xff3a, 0x41], // fullwidth
  [0xff41, 0xff5a, 0x61],
  [0xff10, 0xff19, 0x30],
]

const PUNCTUATION: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201c': '"',
  '\u201d': '"',
  '\u00a0': ' ',
  '\u2007': ' ',
  '\u202f': ' ',
}

/** Folds decorative Unicode letters and smart punctuation down to plain ASCII. */
export function normalizeText(input: string): string {
  let out = ''
  for (const char of input) {
    const code = char.codePointAt(0)
    if (code === undefined) continue
    if (PUNCTUATION[char]) {
      out += PUNCTUATION[char]
      continue
    }
    const range = RANGES.find(([start, end]) => code >= start && code <= end)
    if (range) {
      out += String.fromCharCode(range[2] + (code - range[0]))
      continue
    }
    out += char
  }
  return out
}

const DECORATION =
  /[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{2022}\u{25AA}\u{25CF}\u{00B7}]/gu

/** Removes emoji, arrows and bullet glyphs used as line decoration. */
export function stripDecoration(line: string): string {
  return line
    .replace(DECORATION, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–—*#>]+/, '')
    .replace(/[\s\-–—*]+$/, '')
    .trim()
}
