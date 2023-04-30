/**
 * AJV is a JSON schema validator. This file provides configuration helpers for
 * setting up AJV.
 *
 * Documentation: https://ajv.js.org/
 */

import * as singleton from '@/lib/singleton';
import * as ajv from 'ajv';

/**
 * AJV requires that a "compiler" instance is created from which all other
 * schema are processed. Here we create a singleton for the default compiler to
 * avoid reconstructing a compiler every time we need to process a schema.
 */
export const getAjvSingleton: singleton.Getter<ajv.default> = singleton.fromFactory(
  () => new ajv.default({ useDefaults: true })
);
