const https = require("https");

async function getTLSCertificate(hostname) {
	return new Promise((resolve, reject) => {
		const options = { hostname, port: 443, method: "GET" };

		const req = https.request(options, (res) => {
			const certificate = res.socket.getPeerCertificate();
			resolve(certificate);
		});

		req.on("error", (err) => {
			reject(err);
		});

		req.end();
	});
}

function daysRemaining(expiryDate) {
	const expirationTime = Date.parse(expiryDate);
	const currentTime = Date.now();
	const timeDifference = expirationTime - currentTime;
	const daysRemaining = timeDifference / (1000 * 60 * 60 * 24); // Convert milliseconds to days
	return Math.ceil(daysRemaining); // Rounding up to the nearest whole day
}

async function main() {
	const args = process.argv.slice(2); // Extract command-line arguments, excluding the first two (node executable and script path)
	if (args.length !== 1) {
		console.log("Usage: node yourscriptname.js <website_url>");
		return;
	}

	const website = args[0];

	try {
		const certificate = await getTLSCertificate(website);

		if (certificate && certificate.valid_to) {
			const daysLeft = daysRemaining(certificate.valid_to);

			console.log(`Expires on: ${certificate.valid_to}, which is ${daysLeft} days away.`);

			if (daysLeft === 30 || daysLeft === 15 || daysLeft <= 7) {
				console.log(`Days until certificate expires: ${daysLeft}`);
			}
		} else {
			console.log("Certificate expiration date not found.");
		}
	} catch (error) {
		console.error("Error fetching TLS certificate:", error.message);
	}
}

main();
