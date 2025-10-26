import { JSONReturnType } from '../constants';
import { ContextValues } from '../jsonContext';
import { JSONParser } from '../jsonParser';

export function parseObject(parser: JSONParser): Record<string, JSONReturnType> {
  // <object> ::= '{' [ <member> *(', ' <member>) ] '}'
  const obj: Record<string, JSONReturnType> = {};

  // Parse object members until we find the closing brace
  while ((parser.getCharAt() || '}') !== '}') {
    // Skip whitespace
    parser.skipWhitespacesAt();

    // Sometimes LLMs do weird things, if we find a ":" so early, we'll change it to "," and move on
    if (parser.getCharAt() === ':') {
      parser.log('While parsing an object we found a : before a key, ignoring');
      parser.index++;
    }

    // Set context for parsing the key
    parser.context.set(ContextValues.OBJECT_KEY);

    // Save index in case we need to rollback
    const rollbackIndex = parser.index;

    // Parse the key
    let key = '';
    while (parser.getCharAt()) {
      // Handle special case of array after an array value
      if (parser.getCharAt() === '[' && key === '') {
        const keys = Object.keys(obj);
        const prevKey = keys.length > 0 ? keys[keys.length - 1] : null;

        if (prevKey && Array.isArray(obj[prevKey])) {
          // Parse and merge arrays
          parser.index++;
          const newArray = parser.parseArray(parser);
          if (Array.isArray(newArray)) {
            const prevValue = obj[prevKey] as any[];
            prevValue.push(...(newArray.length === 1 && Array.isArray(newArray[0]) ? newArray[0] : newArray));
          }
          parser.skipWhitespacesAt();
          if (parser.getCharAt() === ',') {
            parser.index++;
          }
          parser.skipWhitespacesAt();
          continue;
        }
      }

      key = String(parser.parseString(parser));
      if (key === '') {
        parser.skipWhitespacesAt();
      }
      if (key !== '' || (key === '' && [':', '}'].includes(parser.getCharAt() || ''))) {
        break;
      }
    }

    // Check for duplicate keys in array context
    if (parser.context.getContext().includes(ContextValues.ARRAY) && key in obj) {
      parser.log('While parsing an object we found a duplicate key, closing the object here and rolling back the index');
      parser.index = rollbackIndex - 1;
      // Add an opening curly brace to make this work
      const before = parser.jsonStr.slice(0, parser.index + 1);
      const after = parser.jsonStr.slice(parser.index + 1);
      parser.jsonStr = before + '{' + after;
      break;
    }

    // Skip whitespace
    parser.skipWhitespacesAt();

    // Check if we reached the end
    if ((parser.getCharAt() || '}') === '}') {
      continue;
    }

    parser.skipWhitespacesAt();

    // Check for colon
    if (parser.getCharAt() !== ':') {
      parser.log('While parsing an object we missed a : after a key');
    } else {
      parser.index++;
    }

    // Set context for parsing the value
    parser.context.reset();
    parser.context.set(ContextValues.OBJECT_VALUE);

    // Skip whitespace
    parser.skipWhitespacesAt();

    // Parse the value
    let value: JSONReturnType = '';
    if ([',', '}'].includes(parser.getCharAt() || '')) {
      parser.log('While parsing an object value we found a stray , ignoring it');
      value = '';
    } else {
      value = parser.parseJson();
    }

    // Add to object if key is not empty
    if (key !== '') {
      obj[key] = value;
    }

    parser.context.reset();

    // Skip whitespace
    parser.skipWhitespacesAt();

    // Check for comma
    if (parser.getCharAt() === ',') {
      parser.index++;
    } else if (parser.getCharAt() !== '}' && parser.getCharAt()) {
      // Missing comma
      parser.log('Missing comma in object, continuing anyway');
    }
  }

  // Skip the closing brace if present
  if (parser.getCharAt() === '}') {
    parser.index++;
  } else {
    parser.log('Missing closing brace for object');
  }

  return obj;
}