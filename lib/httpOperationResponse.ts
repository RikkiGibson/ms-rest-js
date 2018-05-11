// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { WebResource } from "./webResource";

/**
 * Wrapper object for http request and response. Deserialized object is stored in
 * the `parsedBody` property when the response body is received in JSON or XML.
 * @class
 * Initializes a new instance of the HttpOperationResponse class.
 * @constructor
 */
export interface HttpOperationResponse {
  /**
   * The raw request
   */
  request: WebResource;

  statusCode: number;

  headers: { [headerName: string]: string };

  /**
   * The response body as text (string format)
   */
  bodyAsText(): Promise<string | null>;

  /**
   * The response body as a Blob. Only available in the browser.
   * Always rejects when called in node.js.
   */
  bodyAsBlob(): Promise<Blob>;

  /**
   * The response body as a node.js ReadableStream.
   * Always undefined in the browser.
   */
  readableStreamBody?: NodeJS.ReadableStream;

  /**
   * The response body as parsed JSON or XML
   */
  parsedBody(): Promise<any>;
}
