// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import * as FormData from "form-data";
import * as xml2js from "isomorphic-xml2js";
import { HttpClient } from "./httpClient";
import { HttpOperationResponse } from "./httpOperationResponse";
import { WebResource } from "./webResource";
import { RestError } from "./restError";
import { isNode } from "./util/utils";

/**
 * A HttpClient implementation that uses fetch to send HTTP requests.
 */
export class FetchHttpClient implements HttpClient {
  public async sendRequest(httpRequest: WebResource): Promise<HttpOperationResponse> {
    if (!httpRequest) {
      return Promise.reject(new Error("options (WebResource) cannot be null or undefined and must be of type object."));
    }

    if (!httpRequest.headers) {
      httpRequest.headers = {};
    }

    if (httpRequest.formData) {
      const formData: any = httpRequest.formData;
      const requestForm = new FormData();
      const appendFormValue = (key: string, value: any) => {
        if (value && value.hasOwnProperty("value") && value.hasOwnProperty("options")) {
          requestForm.append(key, value.value, value.options);
        } else {
          requestForm.append(key, value);
        }
      };
      for (const formKey in formData) {
        if (formData.hasOwnProperty(formKey)) {
          const formValue = formData[formKey];
          if (formValue instanceof Array) {
            for (let j = 0; j < formValue.length; j++) {
              appendFormValue(formKey, formValue[j]);
            }
          } else {
            appendFormValue(formKey, formValue);
          }
        }
      }

      httpRequest.body = requestForm;
      httpRequest.formData = undefined;
      if (httpRequest.headers && httpRequest.headers["Content-Type"] &&
        httpRequest.headers["Content-Type"].indexOf("multipart/form-data") > -1 && typeof requestForm.getBoundary === "function") {
        httpRequest.headers["Content-Type"] = `multipart/form-data; boundary=${requestForm.getBoundary()}`;
      }
    }

    // allow cross-origin cookies in browser
    (httpRequest as any).credentials = "include";

    const res: Response = await myFetch(httpRequest.url, httpRequest);

    const headers: { [headerName: string]: string } = {};
    const entries = res.headers.entries();
    // due to targeting es5 we have to use a slightly ugly method of iterating the entries
    let entry: IteratorResult<[string, string]>;
    while (!(entry = entries.next()).done) {
      headers[entry.value[0]] = entry.value[1];
    }

    const parsedBody = async () => {
      const text = await res.text();
      const contentType = res.headers.get("Content-Type")!;
      try {
        if (contentType === "application/xml" || contentType === "text/xml") {
          const xmlParser = new xml2js.Parser(XML2JS_PARSER_OPTS);
          const parseString = new Promise(function (resolve: (result: any) => void, reject: (err: any) => void) {
            xmlParser.parseString(operationResponse.bodyAsText!, function (err: any, result: any) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });

          // await so that any exceptions get thrown and caught here
          return await parseString;
        } else {
          return JSON.parse(text);
        }
      } catch (err) {
        const msg = `Error "${err}" occurred while when parsing the response body - ${operationResponse.bodyAsText}.`;
        const errCode = err.code || "PARSE_ERROR";
        throw new RestError(msg, errCode, res.status, httpRequest, res, operationResponse.bodyAsText);
      }
    };

    const operationResponse: HttpOperationResponse = {
      request: httpRequest,
      statusCode: res.status,
      headers,
      bodyAsText: () => res.text(),
      bodyAsBlob: () => res.blob(),
      readableStreamBody: isNode ? res.body as any : undefined,
      parsedBody,
    };

    return operationResponse;
  }
}

/**
 * Provides the fetch() method based on the environment.
 * @returns {fetch} fetch - The fetch() method available in the environment to make requests
 */
export function getFetch(): Function {
  // using window.Fetch in Edge gives a TypeMismatchError
  // (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8546263/).
  // Hence we will be using the fetch-ponyfill for Edge.
  if (typeof window !== "undefined" && window.fetch && window.navigator &&
    window.navigator.userAgent && window.navigator.userAgent.indexOf("Edge/") === -1) {
    return window.fetch.bind(window);
  }
  return require("fetch-ponyfill")({ useCookie: true }).fetch;
}

/**
 * A constant that provides the fetch() method based on the environment.
 */
export const myFetch = getFetch();

const XML2JS_PARSER_OPTS: xml2js.OptionsV2 = {
  explicitArray: false,
  explicitCharkey: false,
  explicitRoot: false
};