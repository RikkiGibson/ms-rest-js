// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { HttpHeaders } from "../httpHeaders";
import { Constants } from "../util/constants";
import { HttpRequest } from "../httpRequest";
import { ServiceClientCredentials } from "./serviceClientCredentials";
const HeaderConstants = Constants.HeaderConstants;
const DEFAULT_AUTHORIZATION_SCHEME = "Basic";

/**
 * Creates a new BasicAuthenticationCredentials object.
 *
 * @constructor
 * @param {string} userName                 User name.
 * @param {string} password                 Password.
 * @param {string} [authorizationScheme]    The authorization scheme.
 */
export class BasicAuthenticationCredentials implements ServiceClientCredentials {
  userName: string;
  password: string;
  authorizationScheme: string = DEFAULT_AUTHORIZATION_SCHEME;
  constructor(userName: string, password: string, authorizationScheme: string = DEFAULT_AUTHORIZATION_SCHEME) {
    if (userName === null || userName === undefined || typeof userName.valueOf() !== "string") {
      throw new Error("userName cannot be null or undefined and must be of type string.");
    }
    if (password === null || password === undefined || typeof password.valueOf() !== "string") {
      throw new Error("password cannot be null or undefined and must be of type string.");
    }
    this.userName = userName;
    this.password = password;
    this.authorizationScheme = authorizationScheme;
  }

  /**
   * Signs a request with the Authentication header.
   *
   * @param {HttpRequest} The WebResource to be signed.
   * @returns {Promise<HttpRequest>} - The signed request object.
   */
  signRequest(webResource: HttpRequest) {
    const credentials = `${this.userName}:${this.password}`;
    const encodedCredentials = `${this.authorizationScheme} ${Buffer.from(credentials).toString("base64")}`;
    if (!webResource.headers) webResource.headers = new HttpHeaders();
    webResource.headers.set(HeaderConstants.AUTHORIZATION, encodedCredentials);
    return Promise.resolve(webResource);
  }
}
