import { JSONReturnType } from './constants';

export class ObjectComparer {
  /**
   * Compare two objects/arrays to see if they are structurally the same
   * Used to detect if a new parsed object is an update of the previous one
   */
  static isSameObject(obj1: JSONReturnType, obj2: JSONReturnType): boolean {
    // If types are different, they're not the same
    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length === 0 || obj2.length === 0) {
        return false;
      }
      // Check if arrays have similar structure
      return this.compareArrayStructure(obj1, obj2);
    }

    // Handle objects
    if (obj1 && obj2 && typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      // Check if at least some keys overlap
      const commonKeys = keys1.filter(k => keys2.includes(k));
      if (commonKeys.length > 0) {
        return true;
      }

      // If no common keys but both have keys, they're different
      if (keys1.length > 0 && keys2.length > 0) {
        return false;
      }
    }

    return false;
  }

  private static compareArrayStructure(arr1: any[], arr2: any[]): boolean {
    // Check if first elements have similar structure
    if (arr1.length > 0 && arr2.length > 0) {
      const firstElem1 = arr1[0];
      const firstElem2 = arr2[0];

      if (typeof firstElem1 === typeof firstElem2) {
        if (typeof firstElem1 === 'object' && firstElem1 !== null && firstElem2 !== null) {
          // For objects in arrays, check if they have overlapping keys
          const keys1 = Object.keys(firstElem1);
          const keys2 = Object.keys(firstElem2);
          const commonKeys = keys1.filter(k => keys2.includes(k));
          return commonKeys.length > 0;
        }
        return true;
      }
    }
    return false;
  }
}