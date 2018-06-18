import { MapperKey as K } from '../../../../../../lib/msRest';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
let internalMappers: any = {};

internalMappers.Cat = {
  [K.required]: false,
  [K.serializedName]: "cat",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "Cat",
    [K.modelProperties]: {
      id: {
        [K.required]: false,
        [K.serializedName]: "id",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      name: {
        [K.required]: false,
        [K.serializedName]: "name",
        [K.type]: {
          [K.name]: "String"
        }
      },
      petName: {
        [K.required]: true,
        [K.serializedName]: "pet\\.type",
        [K.type]: {
          [K.name]: "String"
        }
      },
      color: {
        [K.required]: false,
        [K.serializedName]: "color",
        [K.type]: {
          [K.name]: "String"
        }
      },
      hates: {
        [K.required]: false,
        [K.serializedName]: "hates",
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.required]: false,
            [K.serializedName]: "DogElementType",
            [K.type]: {
              [K.name]: "Composite",
              [K.className]: "Dog"
            }
          }
        }
      }
    }
  }
};
internalMappers.Dog = {
  [K.required]: false,
  [K.serializedName]: "dog",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "Dog",
    [K.modelProperties]: {
      id: {
        [K.required]: false,
        [K.serializedName]: "id",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      name: {
        [K.required]: false,
        [K.serializedName]: "name",
        [K.type]: {
          [K.name]: "String"
        }
      },
      type: {
        [K.required]: true,
        [K.serializedName]: "pet\\.type",
        [K.type]: {
          [K.name]: "String"
        }
      },
      food: {
        [K.required]: false,
        [K.serializedName]: "food",
        [K.type]: {
          [K.name]: "String"
        }
      }
    }
  }
};
internalMappers.Fish = {
  [K.required]: false,
  [K.serializedName]: "Fish",
  [K.type]: {
    [K.name]: "Composite",
    [K.polymorphicDiscriminator]: {
      [K.serializedName]: "fish.type",
      [K.clientName]: "fishtype"
    },
    [K.uberParent]: "Fish",
    [K.className]: "Fish",
    [K.modelProperties]: {
      species: {
        [K.required]: false,
        [K.serializedName]: "species",
        [K.type]: {
          [K.name]: "String"
        }
      },
      length: {
        [K.required]: true,
        [K.serializedName]: "length",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      siblings: {
        [K.required]: false,
        [K.serializedName]: "siblings",
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.required]: false,
            [K.serializedName]: "FishElementType",
            [K.type]: {
              [K.name]: "Composite",
              [K.polymorphicDiscriminator]: {
                [K.serializedName]: "fish.type",
                [K.clientName]: "fishtype"
              },
              [K.uberParent]: "Fish",
              [K.className]: "Fish"
            }
          }
        }
      },
      fishtype: {
        [K.required]: true,
        [K.serializedName]: "fish\\.type",
        [K.type]: {
          [K.name]: "String"
        }
      }
    }
  }
};
internalMappers.Invoice = {
  [K.required]: false,
  [K.serializedName]: "Invoice",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "Invoice",
    [K.modelProperties]: {
      invId: {
        [K.serializedName]: "invoiceId",
        [K.required]: true,
        [K.type]: {
          [K.name]: "Number"
        }
      },
      invDate: {
        [K.serializedName]: "invDate",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Date"
        }
      },
      invProducts: {
        [K.serializedName]: "invProducts",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.type]: {
              [K.name]: "Dictionary",
              [K.value]: {
                [K.type]: {
                  [K.name]: "Composite",
                  [K.className]: "Product"
                }
              }
            }
          }
        }
      }
    }
  }
};
internalMappers.Pet = {
  [K.required]: false,
  [K.serializedName]: "pet",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "Pet",
    [K.polymorphicDiscriminator]: "pet.type",
    [K.modelProperties]: {
      id: {
        [K.required]: false,
        [K.serializedName]: "id",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      name: {
        [K.required]: false,
        [K.serializedName]: "name",
        [K.type]: {
          [K.name]: "String"
        }
      },
      pettype: {
        [K.required]: true,
        [K.serializedName]: "pet\\.type",
        [K.type]: {
          [K.name]: "String"
        }
      }
    }
  }
};
internalMappers.PetGallery = {
  [K.required]: false,
  [K.serializedName]: "PetGallery",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "PetGallery",
    [K.modelProperties]: {
      id: {
        [K.required]: false,
        [K.serializedName]: "id",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      name: {
        [K.required]: false,
        [K.serializedName]: "name",
        [K.type]: {
          [K.name]: "String"
        }
      },
      pets: {
        [K.required]: false,
        [K.serializedName]: "pets",
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.required]: false,
            [K.serializedName]: "petElementType",
            [K.type]: {
              [K.name]: "Composite",
              [K.polymorphicDiscriminator]: "pet.type",
              [K.uberParent]: "Pet",
              [K.className]: "Pet"
            }
          }
        }
      }
    }
  }
};
internalMappers.Product = {
  [K.required]: false,
  [K.serializedName]: "Product",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "Product",
    [K.modelProperties]: {
      id: {
        [K.serializedName]: "id",
        constraints: {

        },
        [K.required]: true,
        [K.type]: {
          [K.name]: "Number"
        }
      },
      name: {
        [K.serializedName]: "name",
        [K.required]: true,
        [K.type]: {
          [K.name]: "String"
        }
      },
      provisioningState: {
        [K.serializedName]: "properties.provisioningState",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Enum",
          [K.allowedValues]: ["Creating", "Failed", "Succeeded"]
        }
      },
      tags: {
        [K.serializedName]: "tags",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Dictionary",
          [K.value]: {
            [K.type]: {
              [K.name]: "String"
            }
          }
        }
      },
      dispatchTime: {
        [K.serializedName]: "dispatchTime",
        [K.required]: false,
        [K.type]: {
          [K.name]: "DateTime"
        }
      },
      invoiceInfo: {
        [K.serializedName]: "invoiceInfo",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Composite",
          [K.className]: "Invoice"
        }
      },
      subProducts: {
        [K.serializedName]: "subProducts",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.type]: {
              [K.name]: "Composite",
              [K.className]: "SubProduct"
            }
          }
        }
      }
    }
  }
};
internalMappers.ProductListResult = {
  [K.required]: false,
  [K.serializedName]: "ProductListResult",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "ProductListResult",
    [K.modelProperties]: {
      value: {
        [K.serializedName]: "",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.type]: {
              [K.name]: "Composite",
              [K.className]: "Product"
            }
          }
        }
      }
    }
  }
};
internalMappers.ProductListResultNextLink = {
  [K.required]: false,
  [K.serializedName]: "ProductListResultNextLink",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "ProductListResultNextLink",
    [K.modelProperties]: {
      value: {
        [K.serializedName]: "",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.type]: {
              [K.name]: "Composite",
              [K.className]: "Product"
            }
          }
        }
      },
      nextLink: {
        [K.serializedName]: "nextLink",
        [K.required]: false,
        [K.type]: {
          [K.name]: "String"
        }
      }
    }
  }
};
internalMappers.SawShark = {
  [K.required]: false,
  [K.serializedName]: "sawshark",
  [K.type]: {
    [K.name]: "Composite",
    [K.polymorphicDiscriminator]: {
      [K.serializedName]: 'fish.type',
      [K.clientName]: 'fishtype'
    },
    [K.uberParent]: 'Fish',
    [K.className]: "Sawshark",
    [K.modelProperties]: {
      species: {
        [K.required]: false,
        [K.serializedName]: "species",
        [K.type]: {
          [K.name]: "String"
        }
      },
      length: {
        [K.required]: true,
        [K.serializedName]: "length",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      siblings: {
        [K.required]: false,
        [K.serializedName]: "siblings",
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.required]: false,
            [K.serializedName]: "FishElementType",
            [K.type]: {
              [K.name]: "Composite",
              [K.polymorphicDiscriminator]: {
                [K.serializedName]: "fish.type",
                [K.clientName]: "fishtype"
              },
              [K.uberParent]: "Fish",
              [K.className]: "Fish"
            }
          }
        }
      },
      fishtype: {
        [K.required]: true,
        [K.serializedName]: "fish\\.type",
        [K.type]: {
          [K.name]: "String"
        }
      },
      age: {
        [K.required]: false,
        [K.serializedName]: "age",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      birthday: {
        [K.required]: true,
        [K.serializedName]: "birthday",
        [K.type]: {
          [K.name]: "DateTime"
        }
      },
      picture: {
        [K.required]: false,
        [K.serializedName]: "picture",
        [K.type]: {
          [K.name]: "ByteArray"
        }
      }
    }
  }
};
internalMappers.Shark = {
  [K.required]: false,
  [K.serializedName]: "shark",
  [K.type]: {
    [K.name]: "Composite",
    [K.polymorphicDiscriminator]: {
      [K.serializedName]: 'fish.type',
      [K.clientName]: 'fishtype'
    },
    [K.uberParent]: 'Fish',
    [K.className]: "Shark",
    [K.modelProperties]: {
      species: {
        [K.required]: false,
        [K.serializedName]: "species",
        [K.type]: {
          [K.name]: "String"
        }
      },
      length: {
        [K.required]: true,
        [K.serializedName]: "length",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      siblings: {
        [K.required]: false,
        [K.serializedName]: "siblings",
        [K.type]: {
          [K.name]: "Sequence",
          [K.element]: {
            [K.required]: false,
            [K.serializedName]: "FishElementType",
            [K.type]: {
              [K.name]: "Composite",
              [K.polymorphicDiscriminator]: {
                [K.serializedName]: "fish.type",
                [K.clientName]: "fishtype"
              },
              [K.uberParent]: "Fish",
              [K.className]: "Fish"
            }
          }
        }
      },
      fishtype: {
        [K.required]: true,
        [K.serializedName]: "fish\\.type",
        [K.type]: {
          [K.name]: "String"
        }
      },
      age: {
        [K.required]: false,
        [K.serializedName]: "age",
        [K.type]: {
          [K.name]: "Number"
        }
      },
      birthday: {
        [K.required]: true,
        [K.serializedName]: "birthday",
        [K.type]: {
          [K.name]: "DateTime"
        }
      }
    }
  }
};
internalMappers.SubProduct = {
  [K.required]: false,
  [K.serializedName]: "SubProduct",
  [K.type]: {
    [K.name]: "Composite",
    [K.className]: "SubProduct",
    [K.modelProperties]: {
      subId: {
        [K.serializedName]: "subId",
        [K.required]: true,
        [K.type]: {
          [K.name]: "Number"
        }
      },
      subName: {
        [K.serializedName]: "subName",
        [K.required]: true,
        [K.type]: {
          [K.name]: "String"
        }
      },
      provisioningState: {
        [K.serializedName]: "provisioningState",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Enum",
          [K.allowedValues]: ["Creating", "Failed", "Succeeded"]
        }
      },
      makeTime: {
        [K.serializedName]: "makeTime",
        [K.required]: false,
        [K.type]: {
          [K.name]: "DateTime"
        }
      },
      invoiceInfo: {
        [K.serializedName]: "invoiceInfo",
        [K.required]: false,
        [K.type]: {
          [K.name]: "Composite",
          [K.className]: "Invoice"
        }
      }
    }
  }
};

internalMappers.discriminators = {
  "Fish": internalMappers.Fish,
  "Fish.shark": internalMappers.Shark,
  "Fish.sawshark": internalMappers.SawShark,
  "Pet": internalMappers.Pet,
  "Pet.Cat": internalMappers.Cat,
  "Pet.Dog": internalMappers.Dog
};

export const Mappers = internalMappers;