import { ReflectionKind, Type, TypeString, typeOf } from "@deepkit/type";

interface Post {
	author: User;
	content: string;
}

interface User {
	id: string;
	name: string;
	age: number;
	likes: string[];
	email?: string;
	posts: Post[];
}
// https://github.com/hanayashiki/deepkit-openapi/blob/master/packages/deepkit-openapi-core/src/TypeSchemaResolver.ts
/**
 * @type ReflectionKind {
    never = 0,
    any = 1,
    unknown = 2,
    void = 3,
    object = 4,
    string = 5,
    number = 6,
    boolean = 7,
    symbol = 8,
    bigint = 9,
    null = 10,
    undefined = 11,
    regexp = 12,
    literal = 13,
    templateLiteral = 14,
    property = 15,
    method = 16,
    function = 17,
    parameter = 18,
    promise = 19,
    // * Uint8Array, Date, custom classes, Set, Map, etc
    class = 20,
    typeParameter = 21,
    enum = 22,
    union = 23,
    intersection = 24,
    array = 25,
    tuple = 26,
    tupleMember = 27,
    enumMember = 28,
    rest = 29,
    objectLiteral = 30,
    indexSignature = 31,
    propertySignature = 32,
    methodSignature = 33,
    infer = 34,
    callSignature = 35
}
 */
export const schemaOfType = (typ: ReturnType<typeof typeOf>) => {
	if (ReflectionKind.propertySignature === typ.kind) {
		return {
			type: "string",
			required: typ.optional,
		};
	}
};

// test
schemaOfType(typeOf<User>());
schemaOfType(typeOf<Post>());
