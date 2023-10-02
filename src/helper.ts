class Helper {
	private _argsCache = null;
	get args() {
		if (this._argsCache != null) return this._argsCache;

		const args = process.argv.slice(2);

		const argumentSet = new Set<string>();

		// Loop through the arguments and add them to the set
		for (const arg of args) {
			if (arg.startsWith("--")) {
				const [name, value] = arg.substring(2).split("=");
				if (name && value) {
					argumentSet[name] = value;
				}
			} else {
				argumentSet.add(arg);
			}
		}

		return this._argsCache = argumentSet;

		// const index = args.indexOf(`--${name}`);
		// if (index !== -1 && index + 1 < args.length) {
		// 	return args[index + 1];
		// }
		// return undefined;
	}

	public isPrimitive(value: any) {
		return typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'boolean' ||
			typeof value === 'undefined' ||
			value === null ||
			typeof value === 'symbol';
	}

	public isPrimitiveByTypeName(typeName: string) {
		if (typeName == null) return true;
		return ['string', 'number', 'boolean', 'undefined', 'symbol'].indexOf(typeName) > -1;
	}

}

export const helper = new Helper;