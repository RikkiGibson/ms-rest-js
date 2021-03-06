// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { HttpClient } from "./httpClient";
import { HttpHeaders } from "./httpHeaders";
import { WebResource, TransferProgressEvent } from "./webResource";
import { HttpOperationResponse } from "./httpOperationResponse";
import { RestError } from "./restError";

/**
 * A HttpClient implementation that uses XMLHttpRequest to send HTTP requests.
 */
export class XhrHttpClient implements HttpClient {
  public sendRequest(request: WebResource): Promise<HttpOperationResponse> {
    const xhr = new XMLHttpRequest();

    const abortSignal = request.abortSignal;
    if (abortSignal) {
      const listener = () => {
        xhr.abort();
      };
      abortSignal.addEventListener("abort", listener);
      xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          abortSignal.removeEventListener("abort", listener);
        }
      });
    }

    addProgressListener(xhr.upload, request.onUploadProgress);
    addProgressListener(xhr, request.onDownloadProgress);

    if (request.formData) {
      const formData = request.formData;
      const requestForm = new FormData();
      const appendFormValue = (key: string, value: any) => {
        if (value && value.hasOwnProperty("value") && value.hasOwnProperty("options")) {
          requestForm.append(key, value.value, value.options);
        } else {
          requestForm.append(key, value);
        }
      };
      for (const formKey of Object.keys(formData)) {
        const formValue = formData[formKey];
        if (Array.isArray(formValue)) {
          for (let j = 0; j < formValue.length; j++) {
            appendFormValue(formKey, formValue[j]);
          }
        } else {
          appendFormValue(formKey, formValue);
        }
      }

      request.body = requestForm;
      request.formData = undefined;
      const contentType = request.headers.get("Content-Type");
      if (contentType && contentType.indexOf("multipart/form-data") !== -1) {
        // browser will automatically apply a suitable content-type header
        request.headers.remove("Content-Type");
      }
    }

    xhr.withCredentials = request.withCredentials;
    xhr.open(request.method, request.url);
    for (const header of request.headers.headersArray()) {
      xhr.setRequestHeader(header.name, header.value);
    }
    xhr.responseType = request.rawResponse ? "blob" : "text";
    xhr.send(request.body);

    if (request.rawResponse) {
      return new Promise((resolve, reject) => {
        xhr.addEventListener("readystatechange", () => {
          // Resolve as soon as headers are loaded
          if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            const bodyPromise = new Promise<Blob>((resolve, reject) => {
              xhr.addEventListener("load", () => {
                resolve(xhr.response);
              });
              rejectOnTerminalEvent(request, xhr, reject);
            });
            resolve({
              request,
              status: xhr.status,
              headers: parseHeaders(xhr),
              blobBody: () => bodyPromise
            });
          }
        });
        rejectOnTerminalEvent(request, xhr, reject);
      });
    } else {
      return new Promise(function(resolve, reject) {
        xhr.addEventListener("load", () => resolve({
          request,
          status: xhr.status,
          headers: parseHeaders(xhr),
          bodyAsText: xhr.responseText
        }));
        rejectOnTerminalEvent(request, xhr, reject);
      });
    }
  }
}

function addProgressListener(xhr: XMLHttpRequestEventTarget, listener?: (progress: TransferProgressEvent) => void) {
  if (listener) {
    xhr.addEventListener("progress", rawEvent => listener({
      loadedBytes: rawEvent.loaded,
      totalBytes: rawEvent.lengthComputable ? rawEvent.total : undefined
    }));
  }
}

function parseHeaders(xhr: XMLHttpRequest) {
  const responseHeaders = new HttpHeaders();
  const headerLines = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
  for (const line of headerLines) {
    const parts = line.split(": ");
    const headerName = parts.shift()!;
    const headerValue = parts.join(": ");
    responseHeaders.set(headerName, headerValue);
  }
  return responseHeaders;
}

function rejectOnTerminalEvent(request: WebResource, xhr: XMLHttpRequest, reject: (err: any) => void) {
  xhr.addEventListener("error", ev => reject(new RestError(ev.message, "REQUEST_SEND_ERROR", undefined, request)));
  xhr.addEventListener("abort", () => reject(new RestError("The request was aborted", "REQUEST_ABORTED_ERROR", undefined, request)));
}
