// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { HttpOperationResponse } from "../httpOperationResponse";
import { getPathStringFromParameter } from "../operationParameter";
import { OperationSpec } from "../operationSpec";
import { Mapper, MapperType } from "../serializer";
import { MapperKey as K } from "../mapperKey";
import * as utils from "../util/utils";
import { WebResource } from "../webResource";
import { BaseRequestPolicy, RequestPolicy, RequestPolicyCreator, RequestPolicyOptions } from "./requestPolicy";

/**
 * Create a new serialization RequestPolicyCreator that will serialized HTTP request bodies as they
 * pass through the HTTP pipeline.
 */
export function serializationPolicy(): RequestPolicyCreator {
  return (nextPolicy: RequestPolicy, options: RequestPolicyOptions) => {
    return new SerializationPolicy(nextPolicy, options);
  };
}

/**
 * A RequestPolicy that will serialize HTTP request bodies as they pass through the HTTP pipeline.
 */
export class SerializationPolicy extends BaseRequestPolicy {
  constructor(nextPolicy: RequestPolicy, options: RequestPolicyOptions) {
    super(nextPolicy, options);
  }

  public sendRequest(request: WebResource): Promise<HttpOperationResponse> {
    let result: Promise<HttpOperationResponse>;
    try {
      this.serializeRequestBody(request);
      result = this._nextPolicy.sendRequest(request);
    } catch (error) {
      result = Promise.reject(error);
    }
    return result;
  }

  /**
   * Serialize the provided HTTP request's body based on the requestBodyMapper assigned to the HTTP
   * request.
   * @param {WebResource} request - The HTTP request that will have its body serialized.
   */
  public serializeRequestBody(request: WebResource): void {
    const operationSpec: OperationSpec | undefined = request.operationSpec;
    if (operationSpec && operationSpec.requestBody) {
      const bodyMapper: Mapper | undefined = operationSpec.requestBody.mapper;
      if (bodyMapper) {
        try {
          if (request.body != undefined || bodyMapper[K.required]) {
            const requestBodyParameterPathString: string = getPathStringFromParameter(operationSpec.requestBody);
            request.body = operationSpec.serializer.serialize(bodyMapper, request.body, requestBodyParameterPathString);
            if (operationSpec.isXML) {
              if (bodyMapper[K.type][K.name] === MapperType.Sequence) {
                request.body = utils.stringifyXML(
                  utils.prepareXMLRootList(request.body, bodyMapper[K.xmlElementName] || bodyMapper[K.xmlName] || bodyMapper[K.serializedName]),
                  { rootName: bodyMapper[K.xmlName] || bodyMapper[K.serializedName] });
              }
              else {
                request.body = utils.stringifyXML(request.body, { rootName: bodyMapper[K.xmlName] || bodyMapper[K.serializedName] });
              }
            } else if (bodyMapper[K.type][K.name] !== MapperType.Stream) {
              request.body = JSON.stringify(request.body);
            }
          }
        } catch (error) {
          throw new Error(`Error "${error.message}" occurred in serializing the payload - ${JSON.stringify(bodyMapper[K.serializedName], undefined, "  ")}.`);
        }
      }
    }
  }
}
