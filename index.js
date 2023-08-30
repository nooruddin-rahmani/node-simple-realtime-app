// Server code
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let formData = [];

app.use(express.static('public'));

const allowedTimes = [
	{ start: 1, end: 18 } // Example time period from 9 AM to 6 PM
	// Add more time periods as needed
];

app.get('/form', (req, res) => {
	res.sendFile(__dirname + '/public/form/form.html');
});
app.get('/', (req, res) => {
	const currentTime = new Date().getHours();

	const isAllowed = allowedTimes.some((timePeriod) => {
		return currentTime >= timePeriod.start && currentTime < timePeriod.end;
	});

	if (!isAllowed) {
		return res.status(403).sendFile(__dirname + '/public/forbidden.html');
	}

	// Handle the route logic during the allowed time
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	console.log('A user connected');

	// Send the current form data to the newly connected client
	socket.emit('formData', formData);

	socket.on('formSubmission', (data) => {
		// Store the form data
		formData.push(data);

		// Emit the updated form data to all connected clients
		io.emit('formData', formData);
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});

http.listen(3004, () => {
	console.log('Server running on port 3004');
});
