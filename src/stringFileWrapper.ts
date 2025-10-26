import * as fs from 'fs';

/**
 * Wrapper class to handle both strings and file descriptors
 * Allows treating files as strings with lazy loading
 */
export class StringFileWrapper {
  private fd: number | null;
  private chunkLength: number;
  private buffer: string = '';
  private filePosition: number = 0;
  private isEOF: boolean = false;

  constructor(fd: number, chunkLength: number = 1024 * 1024) {
    this.fd = fd;
    this.chunkLength = chunkLength || 1024 * 1024; // Default 1MB chunks
  }

  /**
   * Read more data from the file into the buffer
   */
  private readMore(): void {
    if (this.isEOF || this.fd === null) {
      return;
    }

    try {
      const buffer = Buffer.alloc(this.chunkLength);
      const bytesRead = fs.readSync(this.fd, buffer, 0, this.chunkLength, this.filePosition);

      if (bytesRead === 0) {
        this.isEOF = true;
      } else {
        this.buffer += buffer.toString('utf-8', 0, bytesRead);
        this.filePosition += bytesRead;
      }
    } catch (error) {
      this.isEOF = true;
    }
  }

  /**
   * Get character at index (like array access)
   */
  charAt(index: number): string | false {
    // Ensure we have enough data in buffer
    while (this.buffer.length <= index && !this.isEOF) {
      this.readMore();
    }

    if (index >= this.buffer.length) {
      return false;
    }

    return this.buffer[index];
  }

  /**
   * Get length of available data
   */
  get length(): number {
    // Read all remaining data to get accurate length
    while (!this.isEOF) {
      this.readMore();
    }
    return this.buffer.length;
  }

  /**
   * Slice operation for compatibility
   */
  slice(start: number, end?: number): string {
    // Ensure we have enough data
    const neededEnd = end !== undefined ? end : this.length;
    while (this.buffer.length < neededEnd && !this.isEOF) {
      this.readMore();
    }

    return this.buffer.slice(start, end);
  }

  /**
   * Array-like access via index
   */
  [index: number]: string | undefined;
}