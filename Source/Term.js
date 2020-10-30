
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
				const output = string
				return TERM.succeed({tail, source, output, term: self})
			}
			return TERM.fail({tail: input, term: self})
		}
		self.string = string
		return self
	}
	
	TERM.regexp = TERM.regExp = TERM.regex = TERM.regEx = (regexp) => {
		const self = (input) => {
			const fullRegex = new RegExp("^" + regexp.source + "$")
			let i = 0
			while (i <= input.length) {
				const source = input.slice(0, i)
				const success = fullRegex.test(source)
				if (success) {
					const tail = input.slice(source.length)
					const output = source
					return TERM.succeed({tail, source, output, term: self})
				}
				i++
			}
			return TERM.fail({tail: input, term: self})
		}
		self.regexp = regexp
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
				const {tail, source, output} = headResult
				const child = [headResult]
				child.tail = tail
				child.source = source
				child.output = output
				return TERM.succeed({tail, source, output, term: self}, child)
			}
			
			const tail = tailResult.tail
			const source = `${headResult.source}${tailResult.source}`
			const output = `${headResult.output}${tailResult.output}`
			const child = [headResult, ...tailResult.child]
			child.source = source
			child.tail = tail
			child.output = output
			return TERM.succeed({tail, source, output, term: self}, child)
		}
		self.term = term
		return self
	}
	
	TERM.maybe = (term) => {
		const self = (input) => {
			const result = term(input)
			const tail = result.tail
			const source = result.source === undefined? "" : result.source
			const output = result.output === undefined? "" : result.output
			return TERM.succeed({tail, source, output, term: self}, result)
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
	
	TERM.eof = TERM.endOfFile = (input) => {
		if (input.length === 0) {
			return TERM.succeed({term: TERM.eof, source: ""})
		}
		return TERM.fail({term: TERM.eof})
	}
	
	//=======//
	// Terms //
	//=======//
	// THIS is totally broken
	// Fix it after everything has a default output, cos it will be easier to fix then
	TERM.without = function* (terms, term) {
		for (const t of terms) {
			if (t !== term) yield t.d
		}
	}
	
	TERM.cache = {}
	TERM.term = (name) => {
		if (TERM.cache[name] !== undefined) return TERM.cache[name]
		
		const func = (...args) => TERM[name](...args)
		func._.terms.get = () => TERM[name] === undefined? undefined : TERM[name].terms
		func._.term.get = () => TERM[name] === undefined? undefined : TERM[name].term
		func._.func.get = () => TERM[name] === undefined? undefined : TERM[name].func
		func._.regexp.get = () => TERM[name] === undefined? undefined : TERM[name].regexp
		func._.string.get = () => TERM[name] === undefined? undefined : TERM[name].string
		TERM.cache[name] = func
		return func
	}
	
	//====================//
	// In-Built Functions //
	//====================//
	TERM.space = TERM.string(" ")
	TERM.tab = TERM.string("	")
	TERM.newline = TERM.newLine = TERM.string("\n")
	
	TERM.gap = TERM.many(
		TERM.or([
			TERM.space,
			TERM.tab,
		])
	)
	
	TERM.ws = TERM.whitespace = TERM.whiteSpace = TERM.many(
		TERM.or([
			TERM.space,
			TERM.tab,
			TERM.newline,
		])
	)
	
	TERM.name = TERM.list ([
		TERM.regexp(/[a-zA-Z_$]/),
		TERM.many(TERM.regexp(/[a-zA-Z0-9_$]/))
	])
	
	TERM.margin = TERM.or([
		TERM.many(TERM.tab),
		TERM.many(TERM.space),
	])
	
	TERM.line = TERM.many(TERM.regexp(/[^\n]/))
	
}