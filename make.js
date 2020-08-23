
const decoder = new TextDecoder()
const encoder = new TextEncoder()

let source = ""

const readDir = async (path) => {
	for await (const dirEntry of Deno.readDir(path)) {
		const entryPath = `${path}/${dirEntry.name}`
		if (dirEntry.isDirectory) await readDir(entryPath)
		else await readFile(entryPath)
	}
}

const readFile = async (path) => {
	const fileData = await Deno.readFile(path)
	const fileSource = decoder.decode(fileData)
	source += `\n\n//==== ${path} ====//\n`
	source += fileSource
}

await readFile("Source/Array.js")
await readFile("Source/Async.js")
await readFile("Source/Console.js")
await readFile("Source/Bracketless.js")
await readFile("Source/Document.js")
await readFile("Source/Loop.js")
await readFile("Source/Match.js")
await readFile("Source/Report.js")
await readFile("Source/Type.js")
await readFile("Source/Event.js")
await readFile("Source/Worker.js")
await readFile("Source/Vector.js")
await readFile("Source/PropertyEditor.js")
await readFile("Source/Controls.js")
await readFile("Source/Set.js")
await readFile("Source/Stage.js")
await readFile("Source/String.js")
await readFile("Source/Javascript.js")
await readFile("Source/Math.js")
await readFile("Source/Eat.js")
await readFile("Source/Flag.js")
await readFile("Source/ThirdParty/three.min.js")
await readFile("Source/ThirdParty/OrbitControls.js")
await readFile("Source/ThirdParty/EffectComposer.js")
await readFile("Source/ThirdParty/CopyShader.js")
await readFile("Source/ThirdParty/ShaderPass.js")
await readFile("Source/ThirdParty/RenderPass.js")
await readFile("Source/ThirdParty/BokehPass.js")
await readFile("Source/ThirdParty/BokehShader.js")
await readFile("Source/ThirdParty/DepthLimitedBlurShader.js")
await readFile("Source/ThirdParty/UnpackDepthRGBAShader.js")
await readFile("Source/ThirdParty/SAOShader.js")
await readFile("Source/ThirdParty/SAOPass.js")

//await readDir("Source") //TODO: make every file not dependent on each other, and then automatically find and merge them
const data = encoder.encode(source)
await Deno.writeFile("Build/Habitat.js", data)
console.log("[Habitat] Build finished")
