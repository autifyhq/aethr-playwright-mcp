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

import { test, expect } from './fixtures.js';

test('browser_assert_contain_text element PASS', async ({ client }) => {
  await client.callTool({
    name: 'browser_navigate',
    arguments: {
      url: 'data:text/html,<html><title>Title</title><button>Submit</button></html>',
    },
  });

  expect(await client.callTool({
    name: 'browser_assert_contain_text',
    arguments: {
      element: 'Submit button',
      ref: 's1e3',
      against: 'element',
      expected: 'Submit',
    },
  })).toHaveTextContent('{"result":"PASS","against":"element"}');
});

test('browser_assert_contain_text element FAIL', async ({ client }) => {
  await client.callTool({
    name: 'browser_navigate',
    arguments: {
      url: 'data:text/html,<html><title>Title</title><button>Submit</button></html>',
    },
  });

  expect(await client.callTool({
    name: 'browser_assert_contain_text',
    arguments: {
      element: 'Submit button',
      ref: 's1e3',
      against: 'element',
      expected: 'Fail',
    },
  })).toHaveTextContent(/{"result":"FAIL","error":".+","against":"element"}/);
});

test('browser_assert_contain_text page PASS', async ({ client }) => {
  await client.callTool({
    name: 'browser_navigate',
    arguments: {
      url: 'data:text/html,<html><title>Title</title><button>Submit</button></html>',
    },
  });

  expect(await client.callTool({
    name: 'browser_assert_contain_text',
    arguments: {
      against: 'page',
      expected: 'Submit',
    },
  })).toHaveTextContent('{"result":"PASS","against":"page"}');
});

test('browser_assert_contain_text page FAIL', async ({ client }) => {
  await client.callTool({
    name: 'browser_navigate',
    arguments: {
      url: 'data:text/html,<html><title>Title</title><button>Submit</button></html>',
    },
  });

  expect(await client.callTool({
    name: 'browser_assert_contain_text',
    arguments: {
      against: 'page',
      expected: 'Fail',
    },
  })).toHaveTextContent(/{"result":"FAIL","error":".+","against":"page"}/);
});
