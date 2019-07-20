function destructingObjects(obj = Object, sqlComand = String) {
	const keysValues = Object.entries(obj)

	const query = keysValues.reduce((acompliant, current, index) => {

		if (Number.parseInt(current[1])) current[1] = Number.parseInt(current[1])
		else current[1] = "'" + current[1] + "'"

		if (index === 0 && keysValues.length === 1) {
			acompliant = current[0] + ' = ' + current[1]
		} else {
			if (index === 0) {
				acompliant = current[0] + ' = ' + current[1] + sqlComand
			} else if (index < keysValues.length - 1) {
				acompliant += current[0] + ' = ' + current[1] + sqlComand
			} else {
				acompliant += current[0] + ' = ' + current[1]
			}
		}
		return acompliant
	}, '')

	return query
}

module.exports = { destructingObjects }