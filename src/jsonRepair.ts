import { fs, hasFileSystemSupport } from './env';
import { JSONReturnType } from './constants';
import { JSONParser, LogEntry } from './jsonParser';

export interface RepairOptions {
  returnObjects?: boolean;
  skipJsonLoads?: boolean;
  logging?: boolean;
  streamStable?: boolean;
  ensureAscii?: boolean;
  indent?: number;
}

/**
 * Repair a JSON string
 */
export function repairJson(
  jsonStr: string,
  options: RepairOptions & { returnObjects: true; logging: true }
): [JSONReturnType, LogEntry[]];
export function repairJson(
  jsonStr: string,
  options: RepairOptions & { returnObjects: true; logging?: false }
): JSONReturnType;
export function repairJson(
  jsonStr: string,
  options: RepairOptions & { returnObjects?: false; logging: true }
): [string, LogEntry[]];
export function repairJson(
  jsonStr: string,
  options?: RepairOptions
): string;
export function repairJson(
  jsonStr: string,
  options: RepairOptions = {}
): string | JSONReturnType | [string, LogEntry[]] | [JSONReturnType, LogEntry[]] {
  const {
    returnObjects = false,
    skipJsonLoads = false,
    logging = false,
    streamStable = false,
    ensureAscii = true,
    indent = 2
  } = options;

  let parsedJson: JSONReturnType | [JSONReturnType, LogEntry[]];

  if (skipJsonLoads) {
    const parser = new JSONParser(jsonStr, null, logging, 0, streamStable);
    parsedJson = parser.parse();
  } else {
    try {
      // Try standard JSON.parse first
      parsedJson = JSON.parse(jsonStr);
      if (logging) {
        parsedJson = [parsedJson, []];
      }
    } catch {
      // If it fails, use our parser
      const parser = new JSONParser(jsonStr, null, logging, 0, streamStable);
      parsedJson = parser.parse();
    }
  }

  // Handle return values based on options
  if (returnObjects || logging) {
    if (logging && !Array.isArray(parsedJson)) {
      return [parsedJson, []];
    }
    return parsedJson;
  }

  // Return as JSON string
  // Check if parsedJson is a tuple [value, logs] from logging
  let jsonValue = parsedJson;
  if (Array.isArray(parsedJson) && parsedJson.length === 2 && Array.isArray(parsedJson[1])) {
    // This is likely [value, logs] from parser with logging enabled internally
    jsonValue = parsedJson[0];
  }

  // Avoid returning only quotes for empty string
  if (jsonValue === '') {
    return '';
  }

  return JSON.stringify(jsonValue, null, indent);
}

/**
 * Load and repair JSON from a string (similar to JSON.parse)
 */
export function loads(
  jsonStr: string,
  skipJsonLoads: boolean = false,
  logging: boolean = false,
  streamStable: boolean = false
): JSONReturnType | [JSONReturnType, LogEntry[]] {
  return repairJson(jsonStr, {
    returnObjects: true,
    skipJsonLoads,
    logging,
    streamStable
  }) as JSONReturnType | [JSONReturnType, LogEntry[]];
}

/**
 * Load and repair JSON from a file descriptor
 * Note: This function is only available in Node.js environment
 */
export function load(
  fd: number,
  skipJsonLoads: boolean = false,
  logging: boolean = false,
  chunkLength: number = 1024 * 1024
): JSONReturnType | [JSONReturnType, LogEntry[]] {
  if (!hasFileSystemSupport()) {
    throw new Error('load() is only available in Node.js environment. In browser, use repairJson() with string input instead.');
  }

  const parser = new JSONParser('', fd, logging, chunkLength, false);
  const result = parser.parse();

  if (!skipJsonLoads) {
    // Try to validate with JSON.parse if possible
    try {
      const jsonStr = JSON.stringify(Array.isArray(result) ? result[0] : result);
      JSON.parse(jsonStr);
    } catch {
      // Result is already from our parser, which is what we want
    }
  }

  return result;
}

/**
 * Load and repair JSON from a file
 * Note: This function is only available in Node.js environment
 */
export function fromFile(
  filename: string,
  skipJsonLoads: boolean = false,
  logging: boolean = false,
  chunkLength: number = 1024 * 1024
): JSONReturnType | [JSONReturnType, LogEntry[]] {
  if (!hasFileSystemSupport()) {
    throw new Error('fromFile() is only available in Node.js environment. In browser, use repairJson() with string input instead.');
  }

  const fd = fs.openSync(filename, 'r');

  try {
    return load(fd, skipJsonLoads, logging, chunkLength);
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Synchronous file reading helper
 * Note: This function is only available in Node.js environment
 */
export function repairJsonFromFile(
  filename: string,
  options: RepairOptions = {}
): string | JSONReturnType | [string, LogEntry[]] | [JSONReturnType, LogEntry[]] {
  if (!hasFileSystemSupport()) {
    throw new Error('repairJsonFromFile() is only available in Node.js environment. In browser, use repairJson() with string input instead.');
  }

  const content = fs.readFileSync(filename, 'utf-8');
  return repairJson(content, options);
}