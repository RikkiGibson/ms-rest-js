// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import * as assert from "assert";
import { getPathStringFromParameter, OperationParameter } from "../../lib/operationParameter";
import { MapperKey as K } from '../../lib/mapperKey';

describe("getParameterPathString()", () => {
  it("should throw when given undefined", () => {
    assert.throws(() => getPathStringFromParameter(undefined as any));
  });

  it("should throw when given null", () => {
    // tslint:disable-next-line:no-null-keyword
    assert.throws(() => getPathStringFromParameter(null as any));
  });

  it("should return the parameterPath value when parameterPath is a string", () => {
    const parameter: OperationParameter = {
      parameterPath: "pathToParameterValue",
      mapper: {
        [K.serializedName]: "value",
        [K.type]: {
          [K.name]: "number"
        }
      }
    };
    assert.strictEqual(getPathStringFromParameter(parameter), "pathToParameterValue");
  });

  it("should return the dotted version of parameterPath when parameterPath is a string[]", () => {
    const parameter: OperationParameter = {
      parameterPath: ["path", "to", "parameter", "value"],
      mapper: {
        [K.serializedName]: "value",
        [K.type]: {
          [K.name]: "number"
        }
      }
    };
    assert.strictEqual(getPathStringFromParameter(parameter), "path.to.parameter.value");
  });

  it("should return the escaped dotted version of parameterPath when parameterPath is a string[] with dots", () => {
    const parameter: OperationParameter = {
      parameterPath: ["pa.th", "to", "par.ameter", "valu.e"],
      mapper: {
        [K.serializedName]: "value",
        [K.type]: {
          [K.name]: "number"
        }
      }
    };
    assert.strictEqual(getPathStringFromParameter(parameter), "pa.th.to.par.ameter.valu.e");
  });

  it("should return the mapper's serialized name when the parameterPath is an object", () => {
    const parameter: OperationParameter = {
      parameterPath: {
        "a": "A",
        "b": "B"
      },
      mapper: {
        [K.serializedName]: "value",
        [K.type]: {
          [K.name]: "number"
        }
      }
    };
    assert.strictEqual(getPathStringFromParameter(parameter), "value");
  });
});