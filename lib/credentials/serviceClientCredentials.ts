// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { HttpRequest } from "../httpRequest";

export interface ServiceClientCredentials {
  /**
   * Signs a request with the Authentication header.
   *
   * @param {HttpRequest} request The request to be signed.
   * @returns {Promise<HttpRequest>} The signed request object;
   */
  signRequest(request: HttpRequest): Promise<HttpRequest>;
}
