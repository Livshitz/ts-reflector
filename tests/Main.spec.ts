import { Reflector } from '../src/Reflector';

const main = new Reflector(__dirname + '/Module.ts');

test(
    'should return true',
    () => {
        expect(main.generate('my_module')).toEqual({
            my_module: {
                prop1: {
                    kind: 'property',
                    type: 'string',
                },
                ctor: {
                    kind: 'constructor',
                    parameters: {
                        promp2: {
                            type: 'number',
                        },
                    },
                },
                create: {
                    kind: 'method',
                    parameters: {
                        newObj: {
                            isPrimitive: false,
                            type: 'IObject',
                        },
                    },
                    returnType: 'IObject',
                    isPromise: true,
                },
                get: {
                    kind: 'method',
                    parameters: {
                        id: {
                            type: 'string',
                        },
                    },
                    returnType: 'IObject',
                    isPromise: true,
                },
                update: {
                    kind: 'method',
                    parameters: {
                        id: {
                            type: 'string',
                        },
                        obj: {
                            isPrimitive: false,
                            type: 'IObject',
                        },
                    },
                    returnType: 'IObject',
                    isPromise: true,
                },
                delete: {
                    kind: 'method',
                    parameters: {
                        id: {
                            type: 'string',
                        },
                    },
                    returnType: 'boolean',
                    isPromise: true,
                },
            },
        });
    },
    1000 * 10
);
