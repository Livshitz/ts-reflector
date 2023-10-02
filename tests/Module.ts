interface IObject {
	id?: string;
	prop1: number;
	prop2: string;
}

export class Module {
	public prop1: string;

	constructor(private promp2: number) {

	}

	private privateHelper(a: number) {

	}

	public async create(newObj: IObject): Promise<IObject> {
		console.log('create', newObj);
		newObj.id = '123321';
		return newObj;
	}

	public async get(id: string): Promise<IObject> {
		console.log('get', id);
		return {
			id,
			prop1: 1,
			prop2: 'he',
		};
	}

	public async update(id: string, obj: IObject): Promise<IObject> {
		console.log('update', id, obj);
		return obj;
	}

	public async delete(id: string): Promise<boolean> {
		console.log('delete', id);
		return true;
	}
}

export interface IModule extends Module {
	// abc: string;
}