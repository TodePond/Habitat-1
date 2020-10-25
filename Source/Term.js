
// Most TERM functions follow this structure
// They expect an input, and return an object with four properties
// (input) => {success, source, head, tail, output}

TERM = {}

{
	//======//
	// Meta //
	//======//
	TERM.succeed = ({tail, source, output, term}, child) => ({
		success: true,
		tail,
		source,
		output,
		term,
		child,
	})
	
	TERM.fail = ({tail, source, output, term}, child) => ({
		success: false,
		tail,
		source,
		output,
		term,
		child,
	})
	
	//===========//
	// Primitive //
	//===========//
	TERM.string = (string) => {
		const self = (input) => {
			const success = input.slice(0, string.length) == string
			if (success) {
				const tail = input.slice(string.length)
				const source = string
				return TERM.succeed({tail, source, term: self})
			}
			return TERM.fail({tail: input, term: self})
		}
		self.string = string
		return self
	}
	
	TERM.regexp = TERM.regExp = TERM.regex = TERM.regEx = (regex) => {
		const self = (input) => {
			const fullRegex = new RegExp("^" + regex.source + "$")
			let i = 0
			while (i <= input.length) {
				const source = input.slice(0, i)
				const success = fullRegex.test(source)
				if (success) {
					const tail = input.slice(source.length)
					return TERM.succeed({tail, source, term: self})
				}
				i++
			}
			return TERM.fail({tail: input, term: self})
		}
		self.regex = regex
		return self
	}
	
	//=========//
	// Control //
	//=========//
	TERM.emit = (term, func) => {
		const self = (input) => {
			const result = term(input)
			if (result.success) {
				const {tail, source} = result
				const output = result.child === undefined? func(result) : func(result.child)
				return TERM.succeed({tail, source, output, term: self}, result)
			}
			return TERM.fail({tail: input, term: self})
		}
		self.term = term
		self.func = func
		return self
	}
	
	TERM.many = (term) => {
		const self = (input) => {
		
			const headResult = term(input)
			if (!headResult.success) {
				const child = [headResult]
				return TERM.fail({tail: input, term: self}, child)
			}
			
			const tailResult = TERM.many(term)(headResult.tail)
			if (!tailResult.success) {
				const {tail, source} = headResult
				const child = [headResult]
				return TERM.succeed({tail, source, term: self}, child)
			}
			
			const tail = tailResult.tail
			const source = headResult.source + tailResult.source
			const child = [headResult, ...tailResult.child]
			return TERM.succeed({tail, source, term: self}, child)
		}
		self.term = term
		return self
	}
	
	TERM.maybe = (term) => {
		const self = (input) => {
			const result = term(input)
			const {tail, source} = result
			return TERM.succeed({tail, source, source, term: self}, result)
		}
		self.term = term
		return self
	}
	
	TERM.list = (terms) => {
		const self = (input) => {
		
			const headResult = terms[0](input)
			if (!headResult.success) {
				const child = [headResult]
				return TERM.fail({tail: input, term: self}, child)
			}
			
			if (terms.length <= 1) {
				const {tail, source} = headResult
				const child = [headResult]
				return TERM.succeed({tail, source, term: self}, child)
			}
			
			const tailResult = TERM.list(terms.slice(1))(headResult.tail)
			if (!tailResult.success) {
				const source = headResult.source + (tailResult.source === undefined? "" : tailResult.source)
				const child = [headResult, ...tailResult.child]
				return TERM.fail({tail: input, source, term: self}, child)
			}
			
			const tail = tailResult.tail
			const source = headResult.source + tailResult.source
			const child = [headResult, ...tailResult.child]
			return TERM.succeed({tail, source, term: self}, child)
			
		}
		self.terms = terms
		return self
	}
	
	TERM.or = (terms) => {
		const self = (input) => {
			const children = []
			for (const term of terms) {
				const result = term(input)
				children.push(result)
				if (result.success) {
					const {tail, source} = result
					return TERM.succeed({tail, source, term: self}, children)
				}
			}
			return TERM.fail({tail: input, term: self}, children)
		}
		self.terms = terms
		return self
	}
	
	TERM.without = function* (terms, term) {
		for (const t of terms) {
			if (t !== term) yield t
		}
	}
	
	//====================//
	// Control Structures //
	//====================//	
	/*TERM.without = (func, without, ...excess) => {
	
		if (!func.is(Function)) throw new Error(`[Eat] TERM.without expects the first argument to be a function. Instead, received a '${typeof func}'`)
		if (!without.is(Array.of(Function))) throw new Error(`[Eat] TERM.without expects the second argument to be an array of functions. Instead, received a '${without.dir}'`)
		if (excess.length > 0) throw new Error(`[Eat] TERM.without expects 2 functions as arguments. Instead, received ${excess.length + 2} arguments`)
		
		return (source, args) => {
			return func(source, {...args, without: [...args.without, ...without]})
		}
	}*/
	
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