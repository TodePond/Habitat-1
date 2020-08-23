
const decoder = new TextDecoder()
const encoder = new TextEncoder()

let source = ""

const readDir = async (path) => {
	for await (const dirEntry of Deno.readDir(path)) {
		if (dirEntry.isDirectory) await readDir(`${path}/${dirEntry.name}`)
		else {
			const fileData = await Deno.readFile(`${path}/${dirEntry.name}`)
			const fileSource = decoder.decode(fileData)
			source += `\n\n//==== ${path}/${dirEntry.name} ====//\n`
			source += fileSource
		}
	}
}

await readDir("Source")
const data = encoder.encode(source)

console.log(data)
await Deno.writeFile("Habitat.js", data)
