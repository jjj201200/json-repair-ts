import { JSONReturnType } from '../constants';
import { JSONParser } from '../jsonParser';

export function parseComment(parser: JSONParser): JSONReturnType {
  // Parse comments (both // and /* */ style)
  let char = parser.getCharAt();

  if (char === '/') {
    const nextChar = parser.getCharAt(1);

    if (nextChar === '/') {
      // Single-line comment
      parser.log('Found single-line comment, skipping');
      parser.index += 2;
      char = parser.getCharAt();

      // Skip until end of line
      while (char && char !== '\n' && char !== '\r') {
        parser.index++;
        char = parser.getCharAt();
      }

      // Skip the newline character(s)
      if (char === '\r' && parser.getCharAt(1) === '\n') {
        parser.index += 2;
      } else if (char === '\n' || char === '\r') {
        parser.index++;
      }

      // Continue parsing after the comment
      return parser.parseJson();
    } else if (nextChar === '*') {
      // Multi-line comment
      parser.log('Found multi-line comment, skipping');
      parser.index += 2;

      // Skip until we find */
      while (true) {
        char = parser.getCharAt();
        if (!char) {
          parser.log('Unclosed multi-line comment');
          break;
        }

        if (char === '*' && parser.getCharAt(1) === '/') {
          parser.index += 2;
          break;
        }

        parser.index++;
      }

      // Continue parsing after the comment
      return parser.parseJson();
    }
  } else if (char === '#') {
    // Hash-style comment (like Python)
    parser.log('Found hash-style comment, skipping');
    parser.index++;
    char = parser.getCharAt();

    // Skip until end of line
    while (char && char !== '\n' && char !== '\r') {
      parser.index++;
      char = parser.getCharAt();
    }

    // Skip the newline character(s)
    if (char === '\r' && parser.getCharAt(1) === '\n') {
      parser.index += 2;
    } else if (char === '\n' || char === '\r') {
      parser.index++;
    }

    // Continue parsing after the comment
    return parser.parseJson();
  }

  // Not a comment, return empty string
  return '';
}