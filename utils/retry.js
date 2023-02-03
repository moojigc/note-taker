module.exports = async function retry(fn, retriesLeft = 5, interval = 1000) {
	try {
		return await fn();
	} catch (err) {
		if (retriesLeft) {
			await new Promise((r) => setTimeout(r, interval));
			return retry(fn, retriesLeft - 1, interval);
		}
		throw err;
	}
};
