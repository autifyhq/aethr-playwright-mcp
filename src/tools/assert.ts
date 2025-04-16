/**
 * Copyright (c) Autify Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'zod';
import { expect } from '@playwright/test';
import { replaceEnvVar } from './utils.js';

import { defineTool } from './tool.js';
import { generateLocator } from '../context.js';

const elementSchema = z.object({
  element: z.string().describe('Human-readable element description used to obtain permission to interact with the element'),
  ref: z.string().describe('Exact target element reference from the page snapshot'),
});

const assertContainTextSchema = elementSchema.partial().extend({
  against: z.enum(['element', 'page']).describe('Assert against the specified element or the whole page. If page, element and ref are not needed.'),
  expected: z.string().describe('Expected text to be contained in the specified element or the whole page'),
});

const assertContainText = defineTool({
  capability: 'core',
  schema: {
    name: 'browser_assert_contain_text',
    title: 'Assert that the element or the whole page contains the expected text',
    description: 'Returns JSON having "result" (PASS or FAIL), "against" (assert against element or page) and "error" (details if result is FAIL).',
    inputSchema: assertContainTextSchema,
    type: 'readOnly',
  },

  handle: async (context, params) => {
    const validatedParams = assertContainTextSchema.parse(params);
    if (validatedParams.against === 'element') {
      if (validatedParams.ref === undefined)
        throw new Error('ref is required when asserting against an element');
      const locator = context.currentTabOrDie().snapshotOrDie().refLocator(validatedParams.ref);
      const code = [
        `// Assert ${params.element} contains ${params.expected}`,
        `await expect(page.${await generateLocator(locator)}).toContainText('${validatedParams.expected}');`,
      ];
      return {
        code,
        action: async () => {
          try {
            await expect(locator).toContainText(replaceEnvVar(validatedParams.expected));
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ result: 'PASS', against: 'element' }),
              }],
            };
          } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ result: 'FAIL', error, against: 'element' }),
              }],
            };
          }
        },
        captureSnapshot: false,
        waitForNetwork: false,
      };
    } else {
      const locator = context.currentTabOrDie().page.locator('body');
      const code = [
        `// Assert page contains ${params.expected}`,
        `await expect(page.${await generateLocator(locator)}).toContainText('${validatedParams.expected}');`,
      ];
      return {
        code,
        action: async () => {
          try {
            await expect(locator).toContainText(replaceEnvVar(validatedParams.expected));
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ result: 'PASS', against: 'page' }),
              }],
            };
          } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ result: 'FAIL', error, against: 'page' }),
              }],
            };
          }
        },
        captureSnapshot: false,
        waitForNetwork: false,
      };
    }
  },
});

export default [assertContainText];
