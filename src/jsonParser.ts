import { JSONReturnType, STRING_DELIMITERS } from './constants';
import { JsonContext, ContextValues } from './jsonContext';
import { ObjectComparer } from './objectComparer';
import { StringFileWrapper } from './stringFileWrapper';

// Import parsing functions
import { parseArray } from './parsers/parseArray';
import { parseBooleanOrNull } from './parsers/parseBooleanOrNull';
import { parseComment } from './parsers/parseComment';
import { parseNumber } from './parsers/parseNumber';
import { parseObject } from './parsers/parseObject';
import { parseString } from './parsers/parseString';

export interface LogEntry {
  text: string;
  context: string;
}

export class JSONParser {
  public jsonStr: string | StringFileWrapper;
  public index: number = 0;
  public context: JsonContext;
  public logging: boolean;
  public logger: LogEntry[] = [];
  public streamStable: boolean;

  // Bind parser methods
  public parseArray = parseArray;
  public parseBooleanOrNull = parseBooleanOrNull;
  public parseComment = parseComment;
  public parseNumber = parseNumber;
  public parseObject = parseObject;
  public parseString = parseString;

  constructor(
    jsonStr: string | StringFileWrapper,
    jsonFd: number | null,
    logging: boolean = false,
    jsonFdChunkLength: number = 0,
    streamStable: boolean = false
  ) {
    // Handle file descriptor
    if (jsonFd !== null) {
      this.jsonStr = new StringFileWrapper(jsonFd, jsonFdChunkLength);
    } else {
      this.jsonStr = jsonStr as string;
    }

    this.index = 0;
    this.context = new JsonContext();
    this.logging = logging;
    this.streamStable = streamStable;

    // Setup logging
    if (!logging) {
      // No-op for performance
      this.log = () => {};
    }
  }

  parse(): JSONReturnType | [JSONReturnType, LogEntry[]] {
    let json = this.parseJson();

    // Check if there are more JSON elements
    if (this.index < this.getLength()) {
      this.log('The parser returned early, checking if there is more json elements');
      const jsonArray = [json];

      while (this.index < this.getLength()) {
        this.context.reset();
        const j = this.parseJson();

        if (j !== '') {
          // Check if this is an update of the previous object
          if (ObjectComparer.isSameObject(jsonArray[jsonArray.length - 1], j)) {
            // Replace the last entry with the new one
            jsonArray.pop();
          }
          jsonArray.push(j);
        } else {
          // Move index forward
          this.index++;
        }
      }

      // If nothing extra was found, don't return an array
      if (jsonArray.length === 1) {
        this.log('There were no more elements, returning the element without the array');
        json = jsonArray[0];
      } else {
        json = jsonArray;
      }
    }

    if (this.logging) {
      return [json, this.logger];
    } else {
      return json;
    }
  }

  parseJson(): JSONReturnType {
    while (true) {
      const char = this.getCharAt();

      // Check for end of string
      if (char === false) {
        return '';
      }
      // Parse object
      else if (char === '{') {
        this.index++;
        return this.parseObject(this);
      }
      // Parse array
      else if (char === '[') {
        this.index++;
        return this.parseArray(this);
      }
      // Parse string (in context)
      else if (!this.context.empty && (STRING_DELIMITERS.includes(char) || /[a-zA-Z]/.test(char))) {
        return this.parseString(this);
      }
      // Parse number (in context)
      else if (!this.context.empty && (/\d/.test(char) || char === '-' || char === '.')) {
        return this.parseNumber(this);
      }
      // Parse comment
      else if (char === '#' || char === '/') {
        return this.parseComment(this);
      }
      // Ignore and move on
      else {
        this.index++;
      }
    }
  }

  getCharAt(offset: number = 0): string | false {
    try {
      if (this.jsonStr instanceof StringFileWrapper) {
        return this.jsonStr.charAt(this.index + offset);
      } else {
        const idx = this.index + offset;
        if (idx >= 0 && idx < this.jsonStr.length) {
          return this.jsonStr[idx];
        }
        return false;
      }
    } catch {
      return false;
    }
  }

  skipWhitespacesAt(idx: number = 0, moveMainIndex: boolean = true): number {
    try {
      let char = this.getCharAt(idx);

      while (char && /\s/.test(char)) {
        if (moveMainIndex) {
          this.index++;
        } else {
          idx++;
        }
        char = this.getCharAt(idx);
      }

      return idx;
    } catch {
      return idx;
    }
  }

  skipToCharacter(character: string | string[], idx: number = 0): number {
    try {
      let char = this.getCharAt(idx);
      const characterList = Array.isArray(character) ? character : [character];

      while (char && !characterList.includes(char)) {
        idx++;
        char = this.getCharAt(idx);
      }

      // Check for escaped character
      if (idx > 0) {
        const prevChar = this.getCharAt(idx - 1);
        if (prevChar === '\\') {
          // This was escaped, continue searching
          return this.skipToCharacter(character, idx + 1);
        }
      }

      return idx;
    } catch {
      return idx;
    }
  }

  log(text: string): void {
    if (!this.logging) return;

    const window = 10;
    const start = Math.max(this.index - window, 0);
    const end = Math.min(this.index + window, this.getLength());

    let context: string;
    if (this.jsonStr instanceof StringFileWrapper) {
      context = this.jsonStr.slice(start, end);
    } else {
      context = this.jsonStr.slice(start, end);
    }

    this.logger.push({
      text,
      context
    });
  }

  private getLength(): number {
    if (this.jsonStr instanceof StringFileWrapper) {
      return this.jsonStr.length;
    } else {
      return this.jsonStr.length;
    }
  }
}