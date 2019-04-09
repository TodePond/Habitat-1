function sleep(duration) {
	return new Promise (resolve => setTimeout(resolve, duration))
}

async function doAll(promises, ...args) {
	const results = []
	for (const promise of promises) {
		results.push(promise(...args))
	}
	
	return await Promise.all(results)
}

async function all(...promises) {
	let results = []
	await Promise.all(promises).then((values) => {
		results = values
	})
	return results	
}