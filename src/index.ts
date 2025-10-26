// Main exports
import {
  repairJson,
  loads,
  load,
  fromFile,
  repairJsonFromFile,
  type RepairOptions
} from './jsonRepair';

export {
  repairJson,
  loads,
  load,
  fromFile,
  repairJsonFromFile,
  type RepairOptions
};

// Type exports
export {
  type JSONReturnType
} from './constants';

export {
  type LogEntry
} from './jsonParser';

// Class exports (for advanced usage)
export { JSONParser } from './jsonParser';
export { JsonContext, ContextValues } from './jsonContext';
export { ObjectComparer } from './objectComparer';

// Default export with most common functions
const jsonRepair = {
  repair: repairJson,
  loads,
  load,
  fromFile
};

export default jsonRepair;