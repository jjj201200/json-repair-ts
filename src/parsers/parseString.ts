import { JSONReturnType, STRING_DELIMITERS } from '../constants';
import { ContextValues } from '../jsonContext';
import { JSONParser } from '../jsonParser';

export function parseString(parser: JSONParser): JSONReturnType {
  // <string> is a string of valid characters enclosed in quotes
  // Flag to manage corner cases related to missing starting quote
  let missingQuotes = false;
  let doubledQuotes = false;
  let lstringDelimiter = '"';
  let rstringDelimiter = '"';

  let char = parser.getCharAt();
  if (char === '#' || char === '/') {
    return parser.parseComment(parser);
  }

  // A valid string can only start with a valid quote or, in our case, with a literal
  while (char && !STRING_DELIMITERS.includes(char) && !/[a-zA-Z0-9]/.test(char)) {
    parser.index++;
    char = parser.getCharAt();
  }

  if (!char) {
    // This is an empty string
    return '';
  }

  // Ensuring we use the right delimiter
  if (char === "'") {
    lstringDelimiter = rstringDelimiter = "'";
  } else if (char === '\u201C') {
    lstringDelimiter = '\u201C';
    rstringDelimiter = '\u201D';
  } else if (/[a-zA-Z0-9]/.test(char)) {
    // This could be a <boolean> and not a string
    if (char.toLowerCase() === 't' || char.toLowerCase() === 'f' || char.toLowerCase() === 'n') {
      if (parser.context.current !== ContextValues.OBJECT_KEY) {
        const value = parser.parseBooleanOrNull(parser);
        if (value !== '') {
          return value;
        }
      }
    }
    parser.log('While parsing a string, we found a literal instead of a quote');
    missingQuotes = true;
  }

  if (!missingQuotes) {
    parser.index++;
  }

  // Handle doubled quotes case
  if (STRING_DELIMITERS.includes(parser.getCharAt() || '') && parser.getCharAt() === lstringDelimiter) {
    // Check if it's an empty key
    if ((parser.context.current === ContextValues.OBJECT_KEY && parser.getCharAt(1) === ':') ||
        (parser.context.current === ContextValues.OBJECT_VALUE && [',', '}'].includes(parser.getCharAt(1) || ''))) {
      parser.index++;
      return '';
    } else if (parser.getCharAt(1) === lstringDelimiter) {
      parser.log('While parsing a string, we found a doubled quote and then a quote again, ignoring it');
      return '';
    }

    // Find the next delimiter
    const i = parser.skipToCharacter(rstringDelimiter, 1);
    const nextC = parser.getCharAt(i);

    if (nextC && parser.getCharAt(i + 1) === rstringDelimiter) {
      parser.log('While parsing a string, we found a valid starting doubled quote');
      doubledQuotes = true;
      parser.index++;
    } else {
      // Check if this is an empty string or not
      const j = parser.skipWhitespacesAt(1, false);
      const nextChar = parser.getCharAt(j);
      if (STRING_DELIMITERS.includes(nextChar || '') || ['{', '['].includes(nextChar || '')) {
        parser.log('While parsing a string, we found a doubled quote but also another quote afterwards, ignoring it');
        parser.index++;
        return '';
      } else if (![',', ']', '}'].includes(nextChar || '')) {
        parser.log('While parsing a string, we found a doubled quote but it was a mistake, removing one quote');
        parser.index++;
      }
    }
  }

  // Initialize our return value
  let stringAcc = '';

  // Parse the string content
  char = parser.getCharAt();
  let unmatchedDelimiter = false;

  while (char && char !== rstringDelimiter) {
    // Handle missing quotes terminators
    if (missingQuotes) {
      if (parser.context.current === ContextValues.OBJECT_KEY && (char === ':' || /\s/.test(char))) {
        parser.log('While parsing a string missing the left delimiter in object key context, we found a :, stopping here');
        break;
      } else if (parser.context.current === ContextValues.ARRAY && [']', ','].includes(char)) {
        parser.log('While parsing a string missing the left delimiter in array context, we found a ] or ,, stopping here');
        break;
      }
    }

    // Handle object value context terminators
    if (!parser.streamStable &&
        parser.context.current === ContextValues.OBJECT_VALUE &&
        [',', '}'].includes(char) &&
        (!stringAcc || stringAcc[stringAcc.length - 1] !== rstringDelimiter)) {

      let rstringDelimiterMissing = true;

      // Complex logic to check if delimiter is actually missing
      parser.skipWhitespacesAt();
      if (parser.getCharAt(1) === '\\') {
        rstringDelimiterMissing = false;
      }

      const idx = parser.skipToCharacter(rstringDelimiter, 1);
      const nc = parser.getCharAt(idx);

      if (nc) {
        const j = parser.skipWhitespacesAt(idx + 1, false);
        const nextChar = parser.getCharAt(j);
        if (!nextChar || [',', '}'].includes(nextChar)) {
          rstringDelimiterMissing = false;
        }
      }

      if (rstringDelimiterMissing) {
        parser.log('While parsing a string missing the left delimiter in object value context, we found a , or } and we could not determine that a right delimiter was present. Stopping here');
        break;
      }
    }

    // Handle escape sequences
    if (stringAcc && stringAcc[stringAcc.length - 1] === '\\') {
      parser.log('Found a stray escape sequence, normalizing it');
      if ([rstringDelimiter, 't', 'n', 'r', 'b', '\\'].includes(char)) {
        stringAcc = stringAcc.slice(0, -1);
        const escapeSeqs: {[key: string]: string} = {
          't': '\t',
          'n': '\n',
          'r': '\r',
          'b': '\b'
        };
        stringAcc += escapeSeqs[char] || char;
        parser.index++;
        char = parser.getCharAt();
        continue;
      } else if (['u', 'x'].includes(char)) {
        // Unicode escape sequences
        const numChars = char === 'u' ? 4 : 2;
        const nextChars = parser.jsonStr.slice(parser.index + 1, parser.index + 1 + numChars);
        if (nextChars.length === numChars && /^[0-9a-fA-F]+$/.test(nextChars)) {
          parser.log('Found a unicode escape sequence, normalizing it');
          stringAcc = stringAcc.slice(0, -1) + String.fromCharCode(parseInt(nextChars, 16));
          parser.index += 1 + numChars;
          char = parser.getCharAt();
          continue;
        }
      }
    }

    stringAcc += char;
    parser.index++;
    char = parser.getCharAt();

    // Handle stream stable mode
    if (parser.streamStable && !char && stringAcc[stringAcc.length - 1] === '\\') {
      stringAcc = stringAcc.slice(0, -1);
    }
  }

  // Handle closing quote
  if (char !== rstringDelimiter) {
    if (!parser.streamStable) {
      parser.log('While parsing a string, we missed the closing quote, ignoring');
      stringAcc = stringAcc.trimEnd();
    }
  } else {
    parser.index++;
  }

  if (!parser.streamStable && (missingQuotes || (stringAcc && stringAcc[stringAcc.length - 1] === '\n'))) {
    stringAcc = stringAcc.trimEnd();
  }

  return stringAcc;
}