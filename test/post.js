var http = require('http');

var body = JSON.stringify(
    {
        session: {
            Name: "socket test session",
            CreatedBy: {
                Name: "Erik Jan"
            }
        }
    });

var request = new http.ClientRequest({
    hostname: "localhost",
    port: 8001,
    path: "/hello",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
    }
})

request.end(body)