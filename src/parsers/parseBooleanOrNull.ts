import { JSONReturnType } from '../constants';
import { JSONParser } from '../jsonParser';

export function parseBooleanOrNull(parser: JSONParser): JSONReturnType {
  // Parse boolean values (true, false) or null
  const startIndex = parser.index;
  let value = '';
  let char = parser.getCharAt();

  // Collect alphabetic characters
  while (char && /[a-zA-Z]/.test(char)) {
    value += char;
    parser.index++;
    char = parser.getCharAt();
  }

  const lowerValue = value.toLowerCase();

  // Check for valid boolean/null values
  if (lowerValue === 'true') {
    parser.log('Parsed boolean value: true');
    return true;
  } else if (lowerValue === 'false') {
    parser.log('Parsed boolean value: false');
    return false;
  } else if (lowerValue === 'null') {
    parser.log('Parsed null value');
    return null;
  }

  // If not a valid boolean/null, reset and return empty string
  parser.index = startIndex;
  return '';
}