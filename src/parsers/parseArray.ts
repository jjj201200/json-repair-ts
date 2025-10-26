import { JSONReturnType } from '../constants';
import { ContextValues } from '../jsonContext';
import { JSONParser } from '../jsonParser';

export function parseArray(parser: JSONParser): JSONReturnType[] {
  // <array> ::= '[' [ <json> *(', ' <json>) ] ']'
  const array: JSONReturnType[] = [];
  parser.context.set(ContextValues.ARRAY);

  // Skip whitespace
  parser.skipWhitespacesAt();

  // Parse array elements until we find the closing bracket
  while ((parser.getCharAt() || ']') !== ']') {
    // Skip whitespace
    parser.skipWhitespacesAt();

    // Check for trailing comma
    if (parser.getCharAt() === ']') {
      break;
    }

    // Parse the value
    const value = parser.parseJson();

    // Skip empty values unless they're explicitly null or empty strings
    if (value !== '' || parser.getCharAt(-1) === '"' || parser.getCharAt(-1) === "'") {
      array.push(value);
    }

    // Skip whitespace
    parser.skipWhitespacesAt();

    // Check for comma
    if (parser.getCharAt() === ',') {
      parser.index++;
      parser.log('Found comma in array, continuing to next element');
    } else if (parser.getCharAt() !== ']' && parser.getCharAt()) {
      // Missing comma
      parser.log('Missing comma in array, continuing anyway');
    }

    // Skip whitespace
    parser.skipWhitespacesAt();

    // Handle multiple consecutive commas (empty elements)
    while (parser.getCharAt() === ',') {
      parser.log('Found consecutive comma in array, treating as null');
      array.push(null);
      parser.index++;
      parser.skipWhitespacesAt();
    }
  }

  // Skip the closing bracket if present
  if (parser.getCharAt() === ']') {
    parser.index++;
  } else {
    parser.log('Missing closing bracket for array');
  }

  parser.context.reset();
  return array;
}