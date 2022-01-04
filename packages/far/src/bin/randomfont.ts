import { Fonts } from 'figlet';
/**
 * http://www.figlet.org/examples.html
 */
const FONTS = ['isometric1', 'tinker-toy'];

export const getFont = () =>
  FONTS[Math.ceil(Math.random() * FONTS.length)] as Fonts;
