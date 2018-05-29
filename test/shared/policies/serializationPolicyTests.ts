// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import * as assert from "assert";
import { HttpHeaders } from "../../../lib/httpHeaders";
import { HttpOperationResponse } from "../../../lib/httpOperationResponse";
import { RequestPolicy, RequestPolicyOptions } from "../../../lib/policies/requestPolicy";
import { SerializationPolicy } from "../../../lib/policies/serializationPolicy";
import { Serializer } from "../../../lib/serializer";
import { HttpRequest } from "../../../lib/httpRequest";

describe("serializationPolicy", () => {
  const mockPolicy: RequestPolicy = {
    sendRequest(request: HttpRequest): Promise<HttpOperationResponse> {
      return Promise.resolve({
        request: request,
        status: 200,
        headers: new HttpHeaders()
      });
    }
  };

  const serializer = new Serializer();

  it(`should not modify a request that has no request body mapper`, async () => {
    const serializationPolicy = new SerializationPolicy(mockPolicy, new RequestPolicyOptions(), serializer);

    const request = new HttpRequest();
    request.body = "hello there!";

    await serializationPolicy.sendRequest(request);
    assert.strictEqual(request.body, "hello there!");
  });
});