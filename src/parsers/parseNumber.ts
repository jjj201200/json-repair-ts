import { JSONReturnType } from '../constants';
import { JSONParser } from '../jsonParser';
import { ContextValues } from '../jsonContext';

// Number characters as defined in Python version
const NUMBER_CHARS = new Set('0123456789-.eE/,');

export function parseNumber(parser: JSONParser): JSONReturnType {
  // <number> is a valid real number expressed in one of a number of given formats
  let numberStr = '';
  let char = parser.getCharAt();
  const isArray = parser.context.current === ContextValues.ARRAY;

  // Collect number characters, but stop at comma if we're in an array context
  while (char && NUMBER_CHARS.has(char) && (!isArray || char !== ',')) {
    numberStr += char;
    parser.index++;
    char = parser.getCharAt();
  }

  // If the number ends with invalid characters for a number, roll back
  if (numberStr && ['-', 'e', 'E', '/', ','].includes(numberStr[numberStr.length - 1])) {
    numberStr = numberStr.slice(0, -1);
    parser.index--;
  } else if (char && /[a-zA-Z]/.test(char)) {
    // This was a string instead, roll back and parse as string
    parser.index -= numberStr.length;
    return parser.parseString(parser);
  }

  try {
    // If the number contains a comma, return it as a string (like Python version)
    if (numberStr.includes(',')) {
      return numberStr;
    }

    // Parse as float if it contains decimal or exponent
    if (numberStr.includes('.') || numberStr.includes('e') || numberStr.includes('E')) {
      return parseFloat(numberStr);
    } else {
      return parseInt(numberStr, 10);
    }
  } catch (e) {
    // If parsing fails, return the string as-is
    return numberStr;
  }
}