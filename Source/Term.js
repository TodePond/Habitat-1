
// Most TERM functions follow this structure
// They expect an input, and return an object with four properties
// (input) => {success, source, head, tail, output}

TERM = {}

{
	//======//
	// Meta //
	//======//
	TERM.succeed = ({tail, source, output}, arg = {success: true, tail, source, output}) => ({
		success: true,
		tail,
		source,
		output,
		arg,
	})
	
	TERM.fail = ({tail, source, output}, arg = {success: true, tail, source, output}) => ({
		success: false,
		tail,
		source,
		output,
		arg,
	})
	
	//===========//
	// Primitive //
	//===========//
	TERM.string = (string) => (input) => {
		const success = input.slice(0, string.length) == string
		if (success) {
			const tail = input.slice(string.length)
			const source = string
			return TERM.succeed({tail, source})
		}
		return TERM.fail({tail: input})
	}
	
	TERM.regexp = TERM.regExp = TERM.regex = TERM.regEx = (regex) => (input) => {
		const fullRegex = new RegExp("^" + regex.source + "$")
		let i = 0
		while (i <= input.length) {
			const source = input.slice(0, i)
			const success = fullRegex.test(source)
			if (success) {
				const tail = input.slice(source.length)
				return TERM.succeed({tail, source})
			}
			i++
		}
		return TERM.fail({tail: input})
	}
	
	//=========//
	// Control //
	//=========//
	TERM.emit = (term, func) => (input) => {
		const result = term(input)
		if (result.success) {
			const output = func(result.arg)
			return TERM.succeed({...result, output})
		}
		return TERM.fail({tail: input})
	}
	
	TERM.many = (term) => (input) => {
		
		const headResult = term(input)
		if (!headResult.success) {
			return TERM.fail({tail: input})
		}
		
		const tailResult = TERM.many(term)(headResult.tail)
		if (!tailResult.success) {
			const tail = headResult.tail
			const source = headResult.source
			const arg = [headResult.arg]
			return TERM.succeed({tail, source}, arg)
		}
		
		const tail = tailResult.tail
		const source = headResult.source + tailResult.source
		const arg = [headResult.arg, ...tailResult.arg]
		return TERM.succeed({tail, source}, arg)
	}
	
	TERM.maybe = (term) => (input) => {
		const result = term(input)
		if (!result.success) {
			return TERM.succeed({...result, success: true, source: ""})
		}
		return result
	}
	
	//====================//
	// Control Structures //
	//====================//
	/*TERM.maybe = (func, ...excess) => {
	
		if (!func.is(Function)) throw new Error(`[Eat] TERM.maybe expects a function as its only argument. Instead, received a '${typeof func}'`)
		if (excess.length > 0) throw new Error(`[Eat] TERM.maybe expects a function as its only argument. Instead, received ${excess.length + 1} arguments`)
		
		return (source, args) => {
		
			let result = undefined
			let success = undefined
			let code = source
			
			result = {success, code} = func(code, args)
			if (!success) {
				result.success = true
				result.snippet = ""
			}
			
			return result
		}
	}*/
	
	TERM.list = (...funcs) => {
	
		for (const func of funcs) if (!func.is(Function)) {
			throw new Error(`[Eat] TERM.list expects all arguments to be functions, but received a '${typeof func}'`)
		}
		
		return (source, args) => {
		
			// Buffers
			let success = undefined
			let code = source
			
			// Head
			let headResult = undefined
			const headFunc = funcs[0]
			if (headFunc === undefined) return TERM.fail(source)
			headResult = {success, code} = headFunc(code, args)
			if (!success) return {...headResult, code: source}
			
			// Tail
			let tailResult = undefined
			const tailFuncs = funcs.slice(1)
			if (tailFuncs.length == 0) return headResult
			tailResult = {success, code} = TERM.list(...tailFuncs)(code, args)
			tailResult.snippet = headResult.snippet + tailResult.snippet
			return tailResult
		}
	}
	
	TERM.or = (...funcs) => {
		for (const func of funcs) if (!func.is(Function)) {
			throw new Error(`[Eat] TERM.or expects all arguments to be functions, but received a '${typeof func}'`)
		}
		return TERM.orDynamic(funcs)
	}
	
	TERM.orDynamic = (funcs, ...excess) => {
		
		if (excess.length > 0) throw new Error(`[Eat] TERM.orDynamic expects an array of functions as its only argument. Instead, received ${excess.length + 1} arguments`)
		for (const func of funcs) if (!func.is(Function)) {
			throw new Error(`[Eat] TERM.orDynamic expects all arguments to be functions, but received a '${typeof func}'`)
		}
		
		return (source, args = {without: []}) => {
			const {without} = args
			for (const func of funcs) {
				if (without.includes(func)) continue
				const result = func(source, args)
				if (result.success) return result
			}
			return TERM.fail(source)
		}
	}
	
	TERM.without = (func, without, ...excess) => {
	
		if (!func.is(Function)) throw new Error(`[Eat] TERM.without expects the first argument to be a function. Instead, received a '${typeof func}'`)
		if (!without.is(Array.of(Function))) throw new Error(`[Eat] TERM.without expects the second argument to be an array of functions. Instead, received a '${without.dir}'`)
		if (excess.length > 0) throw new Error(`[Eat] TERM.without expects 2 functions as arguments. Instead, received ${excess.length + 2} arguments`)
		
		return (source, args) => {
			return func(source, {...args, without: [...args.without, ...without]})
		}
	}
	
	TERM.and = (...funcs) => {
	
		for (const func of funcs) if (!func.is(Function)) {
			throw new Error(`[Eat] TERM.and expects all arguments to be functions, but received a '${typeof func}'`)
		}
	
		return (source, args) => {
			for (const func of funcs) {
				const result = func(source, args)
				if (!result.success) return TERM.fail(source)
			}
			return TERM.succeed(source)
		}
	}
	
	TERM.not = (func) => (source, args) => {
		const result = func(source, args)
		if (result.success) return TERM.fail(source)
		else return {...result, success: true}
	}
	
	const referenceCache = {}
	TERM.reference = (funcName) => {
		if (referenceCache[funcName] != undefined) return referenceCache[funcName]
		const func = (source, args) => TERM[funcName](source, args)
		referenceCache[funcName] = func
		return func
	}
	TERM.ref = TERM.reference
	
	TERM.eof = TERM.endOfFile = (source) => ({success: source.length == 0, snippet: "", code: source})
	
	//====================//
	// In-Built Functions //
	//====================//
	TERM.space = TERM.string(" ")
	TERM.tab = TERM.string("	")
	TERM.newline = TERM.newLine = TERM.string("\n")
	
	TERM.gap = TERM.many (
		TERM.or (
			TERM.space,
			TERM.tab,
		)
	)
	
	TERM.ws = TERM.whitespace = TERM.whiteSpace = TERM.many (
		TERM.or (
			TERM.space,
			TERM.tab,
			TERM.newline,
		)
	)
	
	TERM.name = TERM.list (
		TERM.regexp(/[a-zA-Z_$]/),
		TERM.many(TERM.regex(/[a-zA-Z0-9_$]/))
	)
	
	TERM.margin = TERM.or (
		TERM.many(TERM.tab),
		TERM.many(TERM.space),
	)
	
	TERM.line = TERM.many(TERM.regex(/[^\n]/))
	
}