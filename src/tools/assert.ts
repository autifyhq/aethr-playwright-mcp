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
import { Tool } from './tool';
import zodToJsonSchema from 'zod-to-json-schema';
import { expect } from '@playwright/test';
import { replaceEnvVar } from './utils';

const elementSchema = z.object({
  element: z.string().describe('Human-readable element description used to obtain permission to interact with the element'),
  ref: z.string().describe('Exact target element reference from the page snapshot'),
});

const assertContainTextSchema = elementSchema.partial().extend({
  against: z.enum(['element', 'page']).describe('Assert against the specified element or the whole page. If page, element and ref are not needed.'),
  expected: z.string().describe('Expected text to be contained in the specified element or the whole page'),
});

const assertContainText: Tool = {
  capability: 'core',
  schema: {
    name: 'browser_assert_contain_text',
    description: 'Assert that the element or the whole page contains the expected text. It returns JSON having "result" (PASS or FAIL), "against" (assert against element or page) and "error" (details if result is FAIL).',
    inputSchema: zodToJsonSchema(assertContainTextSchema),
  },

  handle: async (context, params) => {
    const validatedParams = assertContainTextSchema.parse(params);
    try {
      if (validatedParams.against === 'element') {
        if (validatedParams.ref === undefined)
          throw new Error('ref is required when asserting against an element');
        const locator = context.currentTab().lastSnapshot().refLocator(validatedParams.ref);
        await expect(locator).toContainText(replaceEnvVar(validatedParams.expected));
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ result: 'PASS', against: 'element' }),
          }],
        };
      } else {
        const locator = context.currentTab().page.locator('body');
        await expect(locator).toContainText(replaceEnvVar(validatedParams.expected));
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ result: 'PASS', against: 'page' }),
          }],
        };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ result: 'FAIL', error, against: validatedParams.against }),
        }],
      };
    }
  },
};

export default [assertContainText];
