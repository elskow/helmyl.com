export class SvgPath {
	static parsePathToVertices(pathData: string, scale: number = 1): Float32Array {
		const vertices: number[] = [];
		const commands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
		let currentX = 0;
		let currentY = 0;

		commands.forEach((command) => {
			const type = command[0];
			const args = command
				.slice(1)
				.trim()
				.split(/[\s,]+/)
				.map(Number);

			switch (type) {
				case 'M': // Move to
					currentX = args[0] * scale;
					currentY = args[1] * scale;
					vertices.push(currentX, currentY, 0);
					break;
				case 'L': // Line to
					currentX = args[0] * scale;
					currentY = args[1] * scale;
					vertices.push(currentX, currentY, 0);
					break;
			}
		});

		return new Float32Array(vertices);
	}
}
