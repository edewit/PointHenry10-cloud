var request = require('request');

request.post(
    //"https://cloudappdefa7pmf.osm3.feedhenry.net/poker",
    "http://localhost:8001/poker",
    // "https://pointingpoker-edewit.rhcloud.com/poker",
    {
        json: {
            Name: "socket test session",
            CreatedBy: {
                Name: "Erik Jan"
            }
        }
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        } else {
            console.log("error", error);
        }
    }
);