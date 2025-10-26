export type JSONReturnType =
  | { [key: string]: any }
  | any[]
  | string
  | number
  | boolean
  | null;

export const STRING_DELIMITERS: string[] = ['"', "'", '\u201C', '\u201D'];