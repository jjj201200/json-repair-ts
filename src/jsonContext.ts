export enum ContextValues {
  OBJECT_KEY = "OBJECT_KEY",
  OBJECT_VALUE = "OBJECT_VALUE",
  ARRAY = "ARRAY"
}

export class JsonContext {
  private context: ContextValues[] = [];
  public current: ContextValues | null = null;
  public empty: boolean = true;

  constructor() {
    this.context = [];
    this.current = null;
    this.empty = true;
  }

  /**
   * Set a new context value.
   * @param value - The context value to be added.
   */
  set(value: ContextValues): void {
    this.context.push(value);
    this.current = value;
    this.empty = false;
  }

  /**
   * Remove the most recent context value.
   */
  reset(): void {
    try {
      this.context.pop();
      if (this.context.length > 0) {
        this.current = this.context[this.context.length - 1];
      } else {
        this.current = null;
        this.empty = true;
      }
    } catch {
      this.current = null;
      this.empty = true;
    }
  }

  /**
   * Get the full context stack (used for checking if a value is in context)
   */
  getContext(): ContextValues[] {
    return this.context;
  }
}