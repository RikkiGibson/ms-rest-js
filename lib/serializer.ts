// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import * as utils from "./util/utils";
import * as base64 from "./util/base64";

import { MapperKey as K } from "./mapperKey";

export class Serializer {
  constructor(public readonly modelMappers?: { [key: string]: any }, public readonly isXML?: boolean) { }

  validateConstraints(mapper: Mapper, value: any, objectName: string): void {
    const constraints = mapper[K.constraints];
    if (constraints && value != undefined) {
      for (const constraintType of Object.keys(constraints)) {
        if (constraintType.match(/^ExclusiveMaximum$/ig) !== null) {
          if (value >= (constraints.ExclusiveMaximum as number)) {
            throw new Error(`"${objectName}" with value "${value}" should satify the constraint "ExclusiveMaximum": ${(constraints.ExclusiveMaximum as number)}.`);
          }
        } else if (constraintType.match(/^ExclusiveMinimum$/ig) !== null) {
          if (value <= (constraints.ExclusiveMinimum as number)) {
            throw new Error(`${objectName} " with value "${value} " should satify the constraint "ExclusiveMinimum": ${(constraints.ExclusiveMinimum as number)}.`);
          }
        } else if (constraintType.match(/^InclusiveMaximum$/ig) !== null) {
          if (value > (constraints.InclusiveMaximum as number)) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "InclusiveMaximum": ${(constraints.InclusiveMaximum as number)}.`);
          }
        } else if (constraintType.match(/^InclusiveMinimum$/ig) !== null) {
          if (value < (constraints.InclusiveMinimum as number)) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "InclusiveMinimum": ${(constraints.InclusiveMinimum as number)}.`);
          }
        } else if (constraintType.match(/^MaxItems$/ig) !== null) {
          if (value.length > (constraints.MaxItems as number)) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "MaxItems": ${(constraints.MaxItems as number)}.`);
          }
        } else if (constraintType.match(/^MaxLength$/ig) !== null) {
          if (value.length > (constraints.MaxLength as number)) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "MaxLength": ${(constraints.MaxLength as number)}.`);
          }
        } else if (constraintType.match(/^MinItems$/ig) !== null) {
          if (value.length < (constraints.MinItems as number)) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "MinItems": ${(constraints.MinItems as number)}.`);
          }
        } else if (constraintType.match(/^MinLength$/ig) !== null) {
          if (value.length < (constraints.MinLength as number)) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "MinLength": ${(constraints.MinLength as number)}.`);
          }
        } else if (constraintType.match(/^MultipleOf$/ig) !== null) {
          if (value % (constraints.MultipleOf as number) !== 0) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "MultipleOf": ${(constraints.MultipleOf as number)}.`);
          }
        } else if (constraintType.match(/^Pattern$/ig) !== null) {
          const regexp: RegExp = constraints.Pattern!;
          const match: any = value.match(regexp);
          if (match === null) {
            throw new Error(`${objectName}" with value "${value}" should satify the constraint "Pattern": ${regexp}.`);
          }
        } else if (constraintType.match(/^UniqueItems/ig) !== null) {
          if ((constraints.UniqueItems as boolean)) {
            if (value.length !== value.filter((item: any, i: number, ar: Array<any>) => { { return ar.indexOf(item) === i; } }).length) {
              throw new Error(`${objectName}" with value "${value}" should satify the constraint "UniqueItems": ${(constraints.UniqueItems as boolean)}`);
            }
          }
        }
      }
    }
  }

  /**
   * Serialize the given object based on its metadata defined in the mapper
   *
   * @param {Mapper} mapper The mapper which defines the metadata of the serializable object
   *
   * @param {object|string|Array|number|boolean|Date|stream} object A valid Javascript object to be serialized
   *
   * @param {string} objectName Name of the serialized object
   *
   * @returns {object|string|Array|number|boolean|Date|stream} A valid serialized Javascript object
   */
  serialize(mapper: Mapper, object: any, objectName?: string): any {
    let payload: any = {};
    const mapperType = mapper[K.type][K.name] as string;
    if (!objectName) {
      objectName = mapper[K.serializedName];
    }
    if (mapperType.match(/^Sequence$/ig) !== null) {
      payload = [];
    }

    if (object == undefined) {
      // Throw if required and object is null or undefined
      if (mapper[K.required] && !mapper[K.isConstant]) {
        throw new Error(`${objectName} cannot be null or undefined.`);
      }
      // Set Defaults
      if (mapper[K.defaultValue] != undefined || mapper[K.isConstant]) {
        object = mapper[K.defaultValue];
      }
    }

    if (object == undefined) {
      payload = object;
    } else {
      // Validate Constraints if any
      this.validateConstraints(mapper, object, objectName);
      if (mapperType.match(/^any$/ig) !== null) {
        payload = object;
      } else if (mapperType.match(/^(Number|String|Boolean|Object|Stream|Uuid)$/ig) !== null) {
        payload = serializeBasicTypes(mapperType, objectName, object);
      } else if (mapperType.match(/^Enum$/ig) !== null) {
        const enumMapper: EnumMapper = mapper as EnumMapper;
        payload = serializeEnumType(objectName, enumMapper[K.type][K.allowedValues], object);
      } else if (mapperType.match(/^(Date|DateTime|TimeSpan|DateTimeRfc1123|UnixTime)$/ig) !== null) {
        payload = serializeDateTypes(mapperType, object, objectName);
      } else if (mapperType.match(/^ByteArray$/ig) !== null) {
        payload = serializeByteArrayType(objectName, object);
      } else if (mapperType.match(/^Base64Url$/ig) !== null) {
        payload = serializeBase64UrlType(objectName, object);
      } else if (mapperType.match(/^Sequence$/ig) !== null) {
        payload = serializeSequenceType(this, mapper as SequenceMapper, object, objectName);
      } else if (mapperType.match(/^Dictionary$/ig) !== null) {
        payload = serializeDictionaryType(this, mapper as DictionaryMapper, object, objectName);
      } else if (mapperType.match(/^Composite$/ig) !== null) {
        payload = serializeCompositeType(this, mapper as CompositeMapper, object, objectName);
      }
    }
    return payload;
  }

  /**
   * Deserialize the given object based on its metadata defined in the mapper
   *
   * @param {object} mapper The mapper which defines the metadata of the serializable object
   *
   * @param {object|string|Array|number|boolean|Date|stream} responseBody A valid Javascript entity to be deserialized
   *
   * @param {string} objectName Name of the deserialized object
   *
   * @returns {object|string|Array|number|boolean|Date|stream} A valid deserialized Javascript object
   */
  deserialize(mapper: Mapper, responseBody: any, objectName: string): any {
    if (responseBody == undefined) {
      if (this.isXML && mapper[K.type][K.name] === "Sequence" && !mapper[K.xmlIsWrapped]) {
        // Edge case for empty XML non-wrapped lists. xml2js can't distinguish
        // between the list being empty versus being missing,
        // so let's do the more user-friendly thing and return an empty list.
        responseBody = [];
      } else {
        return responseBody;
      }
      return responseBody;
    }

    let payload: any;
    const mapperType = mapper[K.type][K.name];
    if (!objectName) {
      objectName = mapper[K.serializedName];
    }

    if (mapperType.match(/^Number$/ig) !== null) {
      payload = parseFloat(responseBody);
      if (isNaN(payload)) {
        payload = responseBody;
      }
    } else if (mapperType.match(/^Boolean$/ig) !== null) {
      if (responseBody === "true") {
        payload = true;
      } else if (responseBody === "false") {
        payload = false;
      } else {
        payload = responseBody;
      }
    } else if (mapperType.match(/^(String|Enum|Object|Stream|Uuid|TimeSpan|any)$/ig) !== null) {
      payload = responseBody;
    } else if (mapperType.match(/^(Date|DateTime|DateTimeRfc1123)$/ig) !== null) {
      payload = new Date(responseBody);
    } else if (mapperType.match(/^UnixTime$/ig) !== null) {
      payload = unixTimeToDate(responseBody);
    } else if (mapperType.match(/^ByteArray$/ig) !== null) {
      payload = base64.decodeString(responseBody);
    } else if (mapperType.match(/^Base64Url$/ig) !== null) {
      payload = base64UrlToByteArray(responseBody);
    } else if (mapperType.match(/^Sequence$/ig) !== null) {
      payload = deserializeSequenceType(this, mapper as SequenceMapper, responseBody, objectName);
    } else if (mapperType.match(/^Dictionary$/ig) !== null) {
      payload = deserializeDictionaryType(this, mapper as DictionaryMapper, responseBody, objectName);
    } else if (mapperType.match(/^Composite$/ig) !== null) {
      payload = deserializeCompositeType(this, mapper as CompositeMapper, responseBody, objectName);
    }

    if (mapper[K.isConstant]) {
      payload = mapper[K.defaultValue];
    }

    return payload;
  }
}

function trimEnd(str: string, ch: string) {
  let len = str.length;
  while ((len - 1) >= 0 && str[len - 1] === ch) {
    --len;
  }
  return str.substr(0, len);
}

function bufferToBase64Url(buffer: any): string | undefined {
  if (!buffer) {
    return undefined;
  }
  if (!(buffer instanceof Uint8Array)) {
    throw new Error(`Please provide an input of type Uint8Array for converting to Base64Url.`);
  }
  // Uint8Array to Base64.
  const str = base64.encodeByteArray(buffer);
  // Base64 to Base64Url.
  return trimEnd(str, "=").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlToByteArray(str: string): Uint8Array | undefined {
  if (!str) {
    return undefined;
  }
  if (str && typeof str.valueOf() !== "string") {
    throw new Error("Please provide an input of type string for converting to Uint8Array");
  }
  // Base64Url to Base64.
  str = str.replace(/\-/g, "+").replace(/\_/g, "/");
  // Base64 to Uint8Array.
  return base64.decodeString(str);
}

function splitSerializeName(prop: string): Array<string> {
  const classes: Array<string> = [];
  let partialclass = "";
  const subwords = prop.split(".");

  for (const item of subwords) {
    if (item.charAt(item.length - 1) === "\\") {
      partialclass += item.substr(0, item.length - 1) + ".";
    } else {
      partialclass += item;
      classes.push(partialclass);
      partialclass = "";
    }
  }

  return classes;
}

function dateToUnixTime(d: string | Date): number | undefined {
  if (!d) {
    return undefined;
  }

  if (typeof d.valueOf() === "string") {
    d = new Date(d as string);
  }
  return Math.floor((d as Date).getTime() / 1000);
}

function unixTimeToDate(n: number): Date | undefined {
  if (!n) {
    return undefined;
  }
  return new Date(n * 1000);
}

function serializeBasicTypes(typeName: string, objectName: string, value: any): any {
  if (value !== null && value !== undefined) {
    if (typeName.match(/^Number$/ig) !== null) {
      if (typeof value !== "number") {
        throw new Error(`${objectName} with value ${value} must be of type number.`);
      }
    } else if (typeName.match(/^String$/ig) !== null) {
      if (typeof value.valueOf() !== "string") {
        throw new Error(`${objectName} with value "${value}" must be of type string.`);
      }
    } else if (typeName.match(/^Uuid$/ig) !== null) {
      if (!(typeof value.valueOf() === "string" && utils.isValidUuid(value))) {
        throw new Error(`${objectName} with value "${value}" must be of type string and a valid uuid.`);
      }
    } else if (typeName.match(/^Boolean$/ig) !== null) {
      if (typeof value !== "boolean") {
        throw new Error(`${objectName} with value ${value} must be of type boolean.`);
      }
    } else if (typeName.match(/^Stream$/ig) !== null) {
      const objectType = typeof value;
      if (objectType !== "string" &&
          objectType !== "function" &&
          !(value instanceof ArrayBuffer) &&
          !ArrayBuffer.isView(value) &&
          !(typeof Blob === "function" && value instanceof Blob)) {
        throw new Error(`${objectName} must be a string, Blob, ArrayBuffer, ArrayBufferView, or a function returning NodeJS.ReadableStream.`);
      }
    }
  }
  return value;
}

function serializeEnumType(objectName: string, allowedValues: Array<any>, value: any): any {
  if (!allowedValues) {
    throw new Error(`Please provide a set of allowedValues to validate ${objectName} as an Enum Type.`);
  }
  const isPresent = allowedValues.some((item) => {
    if (typeof item.valueOf() === "string") {
      return item.toLowerCase() === value.toLowerCase();
    }
    return item === value;
  });
  if (!isPresent) {
    throw new Error(`${value} is not a valid value for ${objectName}. The valid values are: ${JSON.stringify(allowedValues)}.`);
  }
  return value;
}

function serializeByteArrayType(objectName: string, value: any): any {
  if (value !== null && value !== undefined) {
    if (!(value instanceof Uint8Array)) {
      throw new Error(`${objectName} must be of type Uint8Array.`);
    }
    value = base64.encodeByteArray(value);
  }
  return value;
}

function serializeBase64UrlType(objectName: string, value: any): any {
  if (value !== null && value !== undefined) {
    if (!(value instanceof Uint8Array)) {
      throw new Error(`${objectName} must be of type Uint8Array.`);
    }
    value = bufferToBase64Url(value);
  }
  return value;
}

function serializeDateTypes(typeName: string, value: any, objectName: string) {
  if (value != undefined) {
    if (typeName.match(/^Date$/ig) !== null) {
      if (!(value instanceof Date ||
        (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in ISO8601 format.`);
      }
      value = (value instanceof Date) ? value.toISOString().substring(0, 10) : new Date(value).toISOString().substring(0, 10);
    } else if (typeName.match(/^DateTime$/ig) !== null) {
      if (!(value instanceof Date ||
        (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in ISO8601 format.`);
      }
      value = (value instanceof Date) ? value.toISOString() : new Date(value).toISOString();
    } else if (typeName.match(/^DateTimeRfc1123$/ig) !== null) {
      if (!(value instanceof Date ||
        (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in RFC-1123 format.`);
      }
      value = (value instanceof Date) ? value.toUTCString() : new Date(value).toUTCString();
    } else if (typeName.match(/^UnixTime$/ig) !== null) {
      if (!(value instanceof Date ||
        (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in RFC-1123/ISO8601 format ` +
          `for it to be serialized in UnixTime/Epoch format.`);
      }
      value = dateToUnixTime(value);
    } else if (typeName.match(/^TimeSpan$/ig) !== null) {
      if (!utils.isDuration(value)) {
        throw new Error(`${objectName} must be a string in ISO 8601 format. Instead was "${value}".`);
      }
      value = value;
    }
  }
  return value;
}

function serializeSequenceType(serializer: Serializer, mapper: SequenceMapper, object: any, objectName: string) {
  if (!Array.isArray(object)) {
    throw new Error(`${objectName} must be of type Array.`);
  }
  if (!mapper[K.type][K.element] || typeof mapper[K.type][K.element] !== "object") {
    throw new Error(`element" metadata for an Array must be defined in the ` +
      `mapper and it must of type "object" in ${objectName}.`);
  }
  const tempArray = [];
  for (let i = 0; i < object.length; i++) {
    tempArray[i] = serializer.serialize(mapper[K.type][K.element], object[i], objectName);
  }
  return tempArray;
}

function serializeDictionaryType(serializer: Serializer, mapper: DictionaryMapper, object: any, objectName: string) {

  if (typeof object !== "object") {
    throw new Error(`${objectName} must be of type object.`);
  }
  if (!mapper[K.type][K.value] || typeof mapper[K.type][K.value] !== "object") {
    throw new Error(`"value" metadata for a Dictionary must be defined in the ` +
      `mapper and it must of type "object" in ${objectName}.`);
  }
  const tempDictionary: { [key: string]: any } = {};
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      tempDictionary[key] = serializer.serialize(mapper[K.type][K.value], object[key], objectName);
    }
  }
  return tempDictionary;
}

function serializeCompositeType(serializer: Serializer, mapper: CompositeMapper, object: any, objectName: string) {
  // check for polymorphic discriminator
  if (mapper[K.type][K.polymorphicDiscriminator]) {
    mapper = getPolymorphicMapper(serializer, mapper, object, objectName, "serialize");
  }

  const payload: any = {};
  let modelMapper: CompositeMapper = {
    [K.required]: false,
    [K.serializedName]: "serializedName",
    [K.type]: {
      [K.name]: "Composite",
      [K.className]: "className",
      [K.modelProperties]: {}
    }
  };
  if (object !== null && object !== undefined) {
    let modelProps = mapper[K.type][K.modelProperties];
    if (!modelProps) {
      if (!mapper[K.type][K.className]) {
        throw new Error(`Class name for model "${objectName}" is not provided in the mapper "${JSON.stringify(mapper, undefined, 2)}".`);
      }
      // get the mapper if modelProperties of the CompositeType is not present and
      // then get the modelProperties from it.
      modelMapper = (serializer.modelMappers as { [key: string]: any })[mapper[K.type][K.className]];
      if (!modelMapper) {
        throw new Error(`mapper() cannot be null or undefined for model "${mapper[K.type][K.className]}".`);
      }
      modelProps = modelMapper[K.type][K.modelProperties];
      if (!modelProps) {
        throw new Error(`modelProperties cannot be null or undefined in the ` +
          `mapper "${JSON.stringify(modelMapper)}" of type "${mapper[K.type][K.className]}" for object "${objectName}".`);
      }
    }

    for (const key of Object.keys(modelProps)) {
      const propertyMapper = modelProps[key];

      let propName: string | undefined;
      let parentObject: any = payload;
      if (serializer.isXML) {
        if (propertyMapper[K.xmlIsWrapped]) {
          propName = propertyMapper[K.xmlName];
        } else {
          propName = propertyMapper[K.xmlElementName] || propertyMapper[K.xmlName];
        }
      } else {
        const paths = splitSerializeName(propertyMapper[K.serializedName]);
        propName = paths.pop();

        for (const pathName of paths) {
          const childObject = parentObject[pathName];
          if ((childObject === null || childObject === undefined) && (object[key] !== null && object[key] !== undefined)) {
            parentObject[pathName] = {};
          }
          parentObject = parentObject[pathName];
        }
      }

      // make sure required properties of the CompositeType are present
      if (propertyMapper[K.required] && !propertyMapper[K.isConstant]) {
        if (object[key] == undefined) {
          throw new Error(`${key}" cannot be null or undefined in "${objectName}".`);
        }
      }
      // make sure that readOnly properties are not sent on the wire
      if (propertyMapper[K.readOnly]) {
        continue;
      }
      // serialize the property if it is present in the provided object instance
      if (((parentObject !== null && parentObject !== undefined) && (propertyMapper[K.defaultValue] !== null && propertyMapper[K.defaultValue] !== undefined)) ||
        (object[key] !== null && object[key] !== undefined)) {
        const propertyObjectName = propertyMapper[K.serializedName] !== ""
          ? objectName + "." + propertyMapper[K.serializedName]
          : objectName;

        const serializedValue = serializer.serialize(propertyMapper, object[key], propertyObjectName);

        if (propName !== null && propName !== undefined) {
          if (propertyMapper[K.xmlIsAttribute]) {
            // $ is the key attributes are kept under in xml2js.
            // This keeps things simple while preventing name collision
            // with names in user documents.
            parentObject.$ = parentObject.$ || {};
            parentObject.$[propName] = serializedValue;
          } else if (propertyMapper[K.xmlIsWrapped]) {
            parentObject[propName] = { [propertyMapper[K.xmlElementName]!]: serializedValue };
          } else {
            parentObject[propName] = serializedValue;
          }
        }
      }
    }
    return payload;
  }
  return object;
}

function deserializeCompositeType(serializer: Serializer, mapper: CompositeMapper, responseBody: any, objectName: string): any {
  /*jshint validthis: true */
  // check for polymorphic discriminator
  if (mapper[K.type][K.polymorphicDiscriminator]) {
    mapper = getPolymorphicMapper(serializer, mapper, responseBody, objectName, "deserialize");
  }

  let instance: { [key: string]: any } = {};
  let modelMapper: Mapper = {
    [K.required]: false,
    [K.serializedName]: "serializedName",
    [K.type]: {
      [K.name]: "Composite"
    }
  };
  responseBody = responseBody || {};
  let modelProps = mapper[K.type][K.modelProperties];
  if (!modelProps) {
    if (!mapper[K.type][K.className]) {
      throw new Error(`Class name for model "${objectName}" is not provided in the mapper "${JSON.stringify(mapper)}"`);
    }
    // get the mapper if modelProperties of the CompositeType is not present and
    // then get the modelProperties from it.
    modelMapper = (serializer.modelMappers as { [key: string]: any })[mapper[K.type][K.className]];
    if (!modelMapper) {
      throw new Error(`mapper() cannot be null or undefined for model "${mapper[K.type][K.className]}"`);
    }
    modelProps = (modelMapper as CompositeMapper)[K.type][K.modelProperties];
    if (!modelProps) {
      throw new Error(`modelProperties cannot be null or undefined in the ` +
        `mapper "${JSON.stringify(modelMapper)}" of type "${mapper[K.type][K.className]}" for responseBody "${objectName}".`);
    }
  }

  for (const key of Object.keys(modelProps)) {
    const propertyMapper = modelProps[key];
    let propertyObjectName = objectName;
    if (propertyMapper[K.serializedName] !== "") {
      propertyObjectName = objectName + "." + propertyMapper[K.serializedName];
    }

    if (serializer.isXML) {
      if (propertyMapper[K.xmlIsAttribute] && responseBody.$) {
        instance[key] = serializer.deserialize(propertyMapper, responseBody.$[propertyMapper[K.xmlName]!], propertyObjectName);
      } else {
        const propertyName = propertyMapper[K.xmlElementName] || propertyMapper[K.xmlName];
        let unwrappedProperty = responseBody[propertyName!];
        if (propertyMapper[K.xmlIsWrapped]) {
          unwrappedProperty = responseBody[propertyMapper[K.xmlName]!];
          unwrappedProperty = unwrappedProperty && unwrappedProperty[propertyMapper[K.xmlElementName]!];
          if (unwrappedProperty === undefined) {
            // undefined means a wrapped list was empty
            unwrappedProperty = [];
          }
        }
        instance[key] = serializer.deserialize(propertyMapper, unwrappedProperty, propertyObjectName);
      }
    } else {
      const paths = splitSerializeName(modelProps[key][K.serializedName]);
      // deserialize the property if it is present in the provided responseBody instance
      let propertyInstance;
      let res = responseBody;
      // traversing the object step by step.
      for (const item of paths) {
        if (!res) break;
        res = res[item];
      }
      propertyInstance = res;
      let serializedValue;
      // paging
      if (Array.isArray(responseBody[key]) && modelProps[key][K.serializedName] === "") {
        propertyInstance = responseBody[key];
        instance = serializer.deserialize(propertyMapper, propertyInstance, propertyObjectName);
      } else if (propertyInstance != undefined) {
        serializedValue = serializer.deserialize(propertyMapper, propertyInstance, propertyObjectName);
        instance[key] = serializedValue;
      }
    }
  }
  return instance;
}

function deserializeDictionaryType(serializer: Serializer, mapper: DictionaryMapper, responseBody: any, objectName: string): any {
  /*jshint validthis: true */
  if (!mapper[K.type][K.value] || typeof mapper[K.type][K.value] !== "object") {
    throw new Error(`"value" metadata for a Dictionary must be defined in the ` +
      `mapper and it must of type "object" in ${objectName}`);
  }
  if (responseBody) {
    const tempDictionary: { [key: string]: any } = {};
    for (const key in responseBody) {
      if (responseBody.hasOwnProperty(key)) {
        tempDictionary[key] = serializer.deserialize(mapper[K.type][K.value], responseBody[key], objectName);
      }
    }
    return tempDictionary;
  }
  return responseBody;
}

function deserializeSequenceType(serializer: Serializer, mapper: SequenceMapper, responseBody: any, objectName: string): any {
  /*jshint validthis: true */
  if (!mapper[K.type][K.element] || typeof mapper[K.type][K.element] !== "object") {
    throw new Error(`element" metadata for an Array must be defined in the ` +
      `mapper and it must of type "object" in ${objectName}`);
  }
  if (responseBody) {
    if (!Array.isArray(responseBody)) {
      // xml2js will interpret a single element array as just the element, so force it to be an array
      responseBody = [responseBody];
    }

    const tempArray = [];
    for (let i = 0; i < responseBody.length; i++) {
      tempArray[i] = serializer.deserialize(mapper[K.type][K.element], responseBody[i], objectName);
    }
    return tempArray;
  }
  return responseBody;
}

function getPolymorphicMapper(serializer: Serializer, mapper: CompositeMapper, object: any, objectName: string, mode: string): CompositeMapper {

  // check for polymorphic discriminator
  // Until version 1.15.1, "polymorphicDiscriminator" in the mapper was a string. This method was not effective when the
  // polymorphicDiscriminator property had a dot in it"s name. So we have comeup with a desgin where polymorphicDiscriminator
  // will be an object that contains the clientName (normalized property name, ex: "odatatype") and
  // the serializedName (ex: "odata.type") (We do not escape the dots with double backslash in this case as it is not required)
  // Thus when serializing, the user will give us an object which will contain the normalizedProperty hence we will lookup
  // the clientName of the polmorphicDiscriminator in the mapper and during deserialization from the responseBody we will
  // lookup the serializedName of the polmorphicDiscriminator in the mapper. This will help us in selecting the correct mapper
  // for the model that needs to be serializes or deserialized.
  // We need this routing for backwards compatibility. This will absorb the breaking change in the mapper and allow new versions
  // of the runtime to work seamlessly with older version (>= 0.17.0-Nightly20161008) of Autorest generated node.js clients.
  if (mapper[K.type][K.polymorphicDiscriminator]) {
    if (typeof mapper[K.type][K.polymorphicDiscriminator] === "string") {
      return getPolymorphicMapperStringVersion(serializer, mapper, object, objectName);
    } else if (mapper[K.type][K.polymorphicDiscriminator] instanceof Object) {
      return getPolymorphicMapperObjectVersion(serializer, mapper, object, objectName, mode);
    } else {
      throw new Error(`The polymorphicDiscriminator for "${objectName}" is neither a string nor an object.`);
    }
  }
  return mapper;
}

// processes new version of the polymorphicDiscriminator in the mapper.
function getPolymorphicMapperObjectVersion(serializer: Serializer, mapper: CompositeMapper, object: any, objectName: string, mode: string): CompositeMapper {

  // check for polymorphic discriminator
  let polymorphicPropertyName = "";
  if (mode === "serialize") {
    polymorphicPropertyName = K.clientName;
  } else if (mode === "deserialize") {
    polymorphicPropertyName = K.serializedName;
  } else {
    throw new Error(`The given mode "${mode}" for getting the polymorphic mapper for "${objectName}" is inavlid.`);
  }
  const discriminatorAsObject: PolymorphicDiscriminator = mapper[K.type][K.polymorphicDiscriminator] as PolymorphicDiscriminator;

  if (discriminatorAsObject &&
    discriminatorAsObject[polymorphicPropertyName] !== null &&
    discriminatorAsObject[polymorphicPropertyName] !== undefined) {
    if (object === null || object === undefined) {
      throw new Error(`${objectName}" cannot be null or undefined. ` +
        `"${discriminatorAsObject[polymorphicPropertyName]}" is the ` +
        `polmorphicDiscriminator and is a required property.`);
    }
    if (object[discriminatorAsObject[polymorphicPropertyName]] === null ||
      object[discriminatorAsObject[polymorphicPropertyName]] === undefined) {
      throw new Error(`No discriminator field "${discriminatorAsObject[polymorphicPropertyName]}" was found in "${objectName}".`);
    }
    let indexDiscriminator = undefined;
    if (object[discriminatorAsObject[polymorphicPropertyName]] === mapper[K.type][K.uberParent]) {
      indexDiscriminator = object[discriminatorAsObject[polymorphicPropertyName]];
    } else {
      indexDiscriminator = mapper[K.type][K.uberParent] + "." + object[discriminatorAsObject[polymorphicPropertyName]];
    }
    if (serializer.modelMappers && serializer.modelMappers.discriminators[indexDiscriminator]) {
      mapper = serializer.modelMappers.discriminators[indexDiscriminator];
    }
  }
  return mapper;
}

// processes old version of the polymorphicDiscriminator in the mapper.
function getPolymorphicMapperStringVersion(serializer: Serializer, mapper: CompositeMapper, object: any, objectName: string): CompositeMapper {
  // check for polymorphic discriminator
  const discriminatorAsString: string = mapper[K.type][K.polymorphicDiscriminator] as string;
  if (discriminatorAsString != undefined) {
    if (object == undefined) {
      throw new Error(`${objectName}" cannot be null or undefined. "${discriminatorAsString}" is the ` +
        `polmorphicDiscriminator and is a required property.`);
    }
    if (object[discriminatorAsString] == undefined) {
      throw new Error(`No discriminator field "${discriminatorAsString}" was found in "${objectName}".`);
    }
    let indexDiscriminator = undefined;
    if (object[discriminatorAsString] === mapper[K.type][K.uberParent]) {
      indexDiscriminator = object[discriminatorAsString];
    } else {
      indexDiscriminator = mapper[K.type][K.uberParent] + "." + object[discriminatorAsString];
    }
    if (serializer.modelMappers && serializer.modelMappers.discriminators[indexDiscriminator]) {
      mapper = serializer.modelMappers.discriminators[indexDiscriminator];
    }
  }

  return mapper;
}

export interface MapperConstraints {
  InclusiveMaximum?: number;
  ExclusiveMaximum?: number;
  InclusiveMinimum?: number;
  ExclusiveMinimum?: number;
  MaxLength?: number;
  MinLength?: number;
  Pattern?: RegExp;
  MaxItems?: number;
  MinItems?: number;
  UniqueItems?: true;
  MultipleOf?: number;
}

export interface BaseMapperType {
  [K.name]: string;
  [key: string]: any;
}

export interface Mapper {
  [K.xmlName]?: string;
  [K.xmlIsAttribute]?: boolean;
  [K.xmlElementName]?: string;
  [K.xmlIsWrapped]?: boolean;
  [K.readOnly]?: boolean;
  [K.isConstant]?: boolean;
  [K.required]?: boolean;
  [K.serializedName]: string;
  [K.type]: BaseMapperType;
  [K.defaultValue]?: any;
  [K.constraints]?: MapperConstraints;
}

export interface PolymorphicDiscriminator {
  [K.serializedName]: string;
  [K.clientName]: string;
  [key: string]: string;
}

export interface CompositeMapper extends Mapper {
  [K.type]: {
    [K.name]: "Composite";
    [K.className]: string;
    [K.modelProperties]?: { [propertyName: string]: Mapper };
    [K.uberParent]?: string;
    [K.polymorphicDiscriminator]?: string | PolymorphicDiscriminator;
  };
}

export interface SequenceMapper extends Mapper {
  [K.type]: {
    [K.name]: "Sequence";
    [K.element]: Mapper;
  };
}

export interface DictionaryMapper extends Mapper {
  [K.type]: {
    [K.name]: "Dictionary";
    [K.value]: Mapper;
  };
}

export interface EnumMapper extends Mapper {
  [K.type]: {
    [K.name]: "Enum";
    [K.allowedValues]: Array<any>;
  };
}

export interface UrlParameterValue {
  [K.value]: string;
  [K.skipUrlEncoding]: boolean;
}

export function serializeObject(toSerialize: any): any {
  if (toSerialize === null || toSerialize === undefined) return undefined;
  if (toSerialize instanceof Uint8Array) {
    toSerialize = base64.encodeByteArray(toSerialize);
    return toSerialize;
  }
  else if (toSerialize instanceof Date) {
    return toSerialize.toISOString();
  }
  else if (Array.isArray(toSerialize)) {
    const array = [];
    for (let i = 0; i < toSerialize.length; i++) {
      array.push(serializeObject(toSerialize[i]));
    }
    return array;
  } else if (typeof toSerialize === "object") {
    const dictionary: { [key: string]: any } = {};
    for (const property in toSerialize) {
      dictionary[property] = serializeObject(toSerialize[property]);
    }
    return dictionary;
  }
  return toSerialize;
}

/**
 * Utility function to create a K:V from a list of strings
 */
function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  const result: any = {};
  for (const key of o) {
    result[key] = key;
  }
  return result;
}

export const MapperType = strEnum([
  "Base64Url",
  "Boolean",
  "ByteArray",
  "Composite",
  "Date",
  "DateTime",
  "DateTimeRfc1123",
  "Dictionary",
  "Enum",
  "Number",
  "Object",
  "Sequence",
  "String",
  "Stream",
  "TimeSpan",
  "UnixTime"
]);