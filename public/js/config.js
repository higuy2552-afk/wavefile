/** Static content: chibi cast, dino crew, gallery slots, toggle deck. */

/* ---------- opening messages (see opening-lines.js, generated verbatim) ---------- */
export { OPENING_LINES } from './opening-lines.js';

/* ---------- chibi cast floating along the page gutters ---------- */
export const CHIBIS = [
  { src: '/assets/chibi5.webp', side: 'left',  top: '10%', w: '7.2vw',  tilt: '-5deg', dur: '9.5s',  delay: '0s' },
  { src: '/assets/chibi2.webp', side: 'right', top: '16%', w: '6.6vw',  tilt: '6deg',  dur: '11s',   delay: '-1.4s' },
  { src: '/assets/chibi3.webp', side: 'left',  top: '33%', w: '6.2vw',  tilt: '4deg',  dur: '10.2s', delay: '-3s' },
  { src: '/assets/chibi4.webp', side: 'right', top: '39%', w: '7vw',    tilt: '-4deg', dur: '12s',   delay: '-2.2s' },
  { src: '/assets/chibi6.webp', side: 'left',  top: '56%', w: '6.8vw',  tilt: '-6deg', dur: '10.8s', delay: '-4.1s' },
  { src: '/assets/chibi7.webp', side: 'right', top: '60%', w: '6.4vw',  tilt: '5deg',  dur: '9.2s',  delay: '-0.8s' },
  { src: '/assets/chibi1.webp', side: 'left',  top: '76%', w: '6.6vw',  tilt: '5deg',  dur: '11.6s', delay: '-5s' },
  { src: '/assets/chibi8.webp', side: 'right', top: '80%', w: '6.9vw',  tilt: '-5deg', dur: '10.4s', delay: '-2.9s' },
];

export const CHIBI_LINES = [
  'อย่าเลื่อนผ่านเร็วสิ… อ่านให้ครบก่อนนะ',
  'หน้านิ่งขนาดนี้ หล่อใช่ไหมล่ะ? บอกมาเลย',
  'กลิ่นดินหลังฝนตก… คิดถึงจัง',
  'อย่าเอามือมาจิ้มสิ เดี๋ยวได้สัมผัสจริง ๆ นะ',
  'อ่านจบแล้วใช่ไหม? รีแอคชั่นล่ะ',
  'เถียงกับเบ๊บสนุกจะตาย ลองดูสิ',
  'เสียงดังไม่ชอบนะ เงียบ ๆ ดีแล้ว',
  'ขี้เกียจแล้ว… ขอไปชาร์จแบตก่อนนะ',
];

/* ---------- dino crew ---------- */
export const DINOS = [
  { id: 'trex',   symbol: 'dino-trex',   cls: '',            name: 'T-REX',   line: 'กดสวิตช์ให้แล้วนะ จัดเต็มไปเลย!' },
  { id: 'stego',  symbol: 'dino-stego',  cls: 'dino--b',     name: 'STEGO',   line: 'หัวข้อ 04 เด็ดนะ อย่าข้าม!' },
  { id: 'bronto', symbol: 'dino-bronto', cls: 'dino--c dino--mint', name: 'BRONTO', line: 'ค่อย ๆ อ่านก็ได้ ผมรอได้' },
];

export const DINO_IDLE = [
  'อ่านช้า ๆ ก็ได้ ไม่มีใครเร่ง',
  'แฟ้มนี้ทำมาให้อลังการเลยนะ',
  'ลองกดปุ่ม “ลูกเล่น” มุมขวาล่างดูสิ',
  'อย่าลืมบอกรีแอคชั่นให้เขาหน่อยนะ',
];

/* ---------- identity gallery slots ----------
 * Supplied character captures, graded into the dossier's emerald film palette.
 */
export const GALLERY_SLOTS = [
  { id: 'char-01', label: 'FULL BODY / 01', pose: '01 · FRONT / TATTOO MAP', src: '/assets/captures/char-01.webp' },
  { id: 'char-02', label: 'FULL BODY / 02', pose: '02 · CASUAL / TANK TOP', src: '/assets/captures/char-02.webp' },
  { id: 'char-03', label: 'FULL BODY / 03', pose: '03 · MIRROR / ACTIVE', src: '/assets/captures/char-03.webp' },
  { id: 'char-04', label: 'FULL BODY / 04', pose: '04 · SUIT / REST MODE', src: '/assets/captures/char-04.webp' },
];

/* ---------- control deck ---------- */
export const SWITCHES = [
  { key: 'rain',      icon: '🌧', name: 'ฝนกุหลาบ',           desc: 'กุหลาบแดงร่วงโปรยลงมาเหมือนฝน' },
  { key: 'eyes',      icon: '👁',  name: 'ดวงตาเฝ้ามอง',        desc: 'มีบางอย่างคอยจับตาอยู่ในความมืด' },
  { key: 'particles', icon: '✨', name: 'อนุภาคเรืองแสง',      desc: 'สปอร์และละอองแสงลอยในอากาศ' },
  { key: 'chibi',     icon: '🧸', name: 'จิบิลอยขอบจอ',        desc: 'จิบิทั้ง 8 ท่าลอยไปตามขอบหน้าเว็บ' },
  { key: 'dino',      icon: '🦖', name: 'ไดโนเสาร์',           desc: 'มาสคอตไดโนเสาร์ประจำแฟ้ม' },
  { key: 'glitch',    icon: '⚡', name: 'กลิตช์',              desc: 'ชื่อตัวละครสั่นและแตกเป็นเส้นสัญญาณ' },
  { key: 'scan',      icon: '📺', name: 'สแกนไลน์',            desc: 'เส้นสแกนแบบจอภาพเกม' },
  { key: 'grain',     icon: '🎞', name: 'ฟิล์มเกรน',           desc: 'เม็ดฟิล์มแบบภาพยนตร์' },
  { key: 'audio',     icon: '🔊', name: 'เสียงเอฟเฟค',         desc: 'เสียงคลิก วาร์ป และระเบิด' },
  { key: 'motion',    icon: '🌀', name: 'แอนิเมชันเต็มรูปแบบ',  desc: 'ปิดเพื่อลดการเคลื่อนไหวทั้งหน้า' },
];

/* ---------- file bar ticker ---------- */
export const TICKER_LINES = [
  'SUBJECT: WAVE HRANG PETROLE',
  'CLASS: D-',
  'THREAT LEVEL: LOW',
  '200 CM / 91 KG / 42 Y',
  'STATUS: ACTIVE',
  'ENERGY SIGNATURE: RAW · VOLATILE',
  'NOTE: อ่านให้จบนะ แล้วบอกรีแอคชั่นด้วย',
];
