import { Node, isMethodDeclaration, getCombinedModifierFlags, ModifierFlags, NodeArray, Identifier, isPropertyDeclaration, isPropertySignature, TypeNode, ClassDeclaration, InterfaceDeclaration, InterfaceType, SyntaxKind, TypeChecker, createProgram, isClassDeclaration, isConstructorDeclaration, isInterfaceDeclaration, isMethodSignature, Symbol, ParameterDeclaration } from 'typescript';
import fs from 'fs';
import { helper } from './helper';

export class Reflector {
	constructor(private sourceFilePath: string) {
		console.log('Reflector:ctor: ', sourceFilePath);
	}

	public generate(customRootName?: string) {
		// Load the source file
		// const sourceCode = fs.readFileSync(this.sourceFilePath)?.toString();

		// Read the source file
		// const sourceFile = createSourceFile(
		// 	this.sourceFilePath,
		// 	sourceCode,
		// 	ScriptTarget.Latest,
		// 	true
		// );

		if (!fs.existsSync(this.sourceFilePath)) {
			throw `Reflector:generate: Input file not found! (${this.sourceFilePath}, dir: ${__dirname})`
		}

		const program = createProgram([this.sourceFilePath], {});
		// const program = createProgram([sourceFile.fileName], { allowJs: true });
		// const x = getPreEmitDiagnostics(program);
		// console.log("DBG: ", x);
		const typeChecker = program.getTypeChecker();

		let ret = {};

		// const filename = libx.node.getFilename(this.sourceFilePath);
		const sourceFile = program.getSourceFile(this.sourceFilePath);

		for (let statement of sourceFile.statements) {
			if (statement.kind !== SyntaxKind.InterfaceDeclaration) continue;
			// Find the interface

			const node = statement as InterfaceDeclaration;

			const members = this.processNode(node, typeChecker);
			if (members == null) continue;


			// Process the interface members
			// const members = node.members.map((member) => {
			// 	if (isPropertySignature(member)) {
			// 		return {
			// 			kind: "property",
			// 			name: (member.name as Identifier).text,
			// 			type: (member.type as TypeNode).getText(),
			// 		};
			// 	} else if (isMethodSignature(member)) {
			// 		return {
			// 			kind: "method",
			// 			name: (member.name as Identifier).text,
			// 			parameters: member.parameters.map((param) => ({
			// 				name: (param.name as Identifier).text,
			// 				type: (param.type as TypeNode).getText(),
			// 			})),
			// 			returnType: (member.type as TypeNode).getText(),
			// 		};
			// 	}
			// });

			const name = customRootName ?? (node.name as Identifier).text;
			ret[name] = {
				// name: (node.name as Identifier).text,
				...members,
			};

		}

		return ret;
	}

	private isPrivateMethod(node: Node): boolean {
		if (isMethodDeclaration(node)) {
			const modifiers = getCombinedModifierFlags(node);
			return (modifiers & ModifierFlags.Private) !== 0;
		}
		return false;
	}

	private isParameterOptional(node: ParameterDeclaration): boolean {
		// Check if the parameter has a question mark (?), indicating it's optional.
		return !!node.questionToken;
	}

	private processMembers(members: NodeArray<any>) {
		return members.reduce((agg, member) => {
			const name = (member.name as Identifier)?.text;
			if (isPropertySignature(member) || isPropertyDeclaration(member)) {
				agg[name] = {
					kind: "property",
					// name: (member.name as Identifier).text,
					type: (member.type as TypeNode).getText(),
				};
			} else if (isMethodSignature(member) || isMethodDeclaration(member)) {
				const retType = member.type ? (member.type as TypeNode).getText() : "void";
				const isPromise = retType?.startsWith('Promise<') ?? false;
				const promiseType = /\<(.+)\>/.exec(retType)?.[1];

				if (this.isPrivateMethod(member)) return agg;

				agg[name] = {
					kind: "method",
					// name: (member.name as Identifier).text,
					// parameters: member.parameters.map((param) => ({
					// 	name: (param.name as Identifier).text,
					// 	type: (param.type as TypeNode).getText(),
					// })),
					parameters: member.parameters.reduce((agg, param) => {
						const name = (param.name as Identifier).text;
						const isOptional = this.isParameterOptional(param);
						const type = (param.type as TypeNode).getText();
						const isPrimitive = helper.isPrimitiveByTypeName(type)
						agg[name] = {
							type,
						};
						if (isOptional) agg[name].isOptional = isOptional;
						if (!isPrimitive) agg[name].isPrimitive = isPrimitive;
						return agg;
					}, {}),

					returnType: promiseType ?? retType,
					isPromise: isPromise,
				};

			} else if (isConstructorDeclaration(member)) {
				agg['ctor'] = {
					kind: "constructor",
					parameters: member.parameters.reduce((agg, param) => {
						const name = (param.name as Identifier).text;
						agg[name] = {
							type: (param.type as TypeNode).getText(),
						};
						return agg;
					}, {}),
				};
			} else if (isClassDeclaration(member)) {
				agg[name] = {
					kind: "class",
					// parameters: (member as SignatureDeclarationBase).parameters.reduce((agg, param) => {
					// 	const name = (param.name as Identifier).text;
					// 	agg[name] = {
					// 		type: (param.type as TypeNode).getText(),
					// 	};
					// 	return agg;
					// }, {}),
				};
			} else {
			}

			return agg;
		}, {});
	}

	private getSymbolAtLocation(node: Node): Symbol {
		return (node as any).symbol;
	}

	private isClassExported(node: ClassDeclaration): boolean {
		// Check if the class declaration has an "export" modifier
		return (
			!!node.modifiers && node.modifiers.some((modifier) => modifier.kind === SyntaxKind.ExportKeyword)
		);
	}

	private processNode(node: InterfaceDeclaration, typeChecker: TypeChecker) {
		let members = this.processMembers(node.members);

		// const symbol = typeChecker.getSymbolAtLocation(interfaceNode);
		const symbol = this.getSymbolAtLocation(node);
		const type = typeChecker.getDeclaredTypeOfSymbol(symbol);
		const baseTypes = typeChecker.getBaseTypes(type as InterfaceType);

		if (!this.isClassExported(<any>node)) return null;

		let nodeType = 'n/a';
		if (isInterfaceDeclaration(node)) nodeType = 'interface';
		else if (isClassDeclaration(node)) nodeType = 'class';

		for (const baseType of baseTypes) {
			const baseInterfaceNode = baseType.symbol.declarations[0] as InterfaceDeclaration;
			const extendedMembers = this.processNode(baseInterfaceNode, typeChecker);
			members = { ...members, ...extendedMembers };
		}

		return {
			// type: nodeType,
			...members,
		};
	}
}