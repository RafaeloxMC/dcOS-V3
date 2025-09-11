import Union from "../database/schemas/Union";
import { Union as UnionType } from "../types";

async function validateServerUnion(id: string): Promise<UnionType | false> {
	if (!id) return false;
	return await Union.findOne({ members: id }).then((data) => {
		if (data) {
			console.log(data);
			return data as UnionType;
		} else {
			console.log("No union found for id: " + id);
			return false;
		}
	});
}

export { validateServerUnion };
