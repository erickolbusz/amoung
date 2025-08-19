async function fetchJSON(url, timeoutMs) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {signal: ctrl.signal, cache: "no-store" });
		if (!res.ok) throw new Error("NOT OK");
		return await res.json();
	} finally {
		clearTimeout(t);
	}
}

document.getElementById("ApiButton").onclick = function() {
	fetchJSON("https://ksf.surf/api/players/STEAM_0:1:34930102/bestrecords/1?game=css&mode=0", 10000).then(data => {
		$("#Output").text(data);
	});
};

console.log("A");