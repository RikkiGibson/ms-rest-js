// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { HttpHeaders } from "../httpHeaders";
import { Constants } from "../util/constants";
import { HttpRequest } from "../httpRequest";
import { ServiceClientCredentials } from "./serviceClientCredentials";

const HeaderConstants = Constants.HeaderConstants;
const DEFAULT_AUTHORIZATION_SCHEME = "Bearer";

/**
 * Creates a new TokenCredentials object.
 *
 * @constructor
 * @param {string} token               The token.
 * @param {string} authorizationScheme The authorization scheme.
 */
export class TokenCredentials implements ServiceClientCredentials {
  token: string;
  authorizationScheme: string = DEFAULT_AUTHORIZATION_SCHEME;

  constructor(token: string, authorizationScheme: string = DEFAULT_AUTHORIZATION_SCHEME) {
    if (!token) {
      throw new Error("token cannot be null or undefined.");
    }
    this.token = token;
    this.authorizationScheme = authorizationScheme;
  }

  /**
   * Signs a request with the Authentication header.
   *
   * @param {HttpRequest} The request to be signed.
   * @return {Promise<HttpRequest>} The signed request object.
   */
  signRequest(webResource: HttpRequest) {
    if (!webResource.headers) webResource.headers = new HttpHeaders();
    webResource.headers.set(HeaderConstants.AUTHORIZATION, `${this.authorizationScheme} ${this.token}`);
    return Promise.resolve(webResource);
  }
}
