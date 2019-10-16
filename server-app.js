const http = require('http');
const httpProxy = require('http-proxy');
const express = require('express');
const fs = require('express');

var Twitter = require('twitter');
var config = require("./config.js");

var T = new Twitter(config);

// Search parameters
var params = {
    // stores the search query; can be anything with the # tag added to it
    q: '#spongebob',
    // specify the number of tweets to return
    count: 10,
    // returns only the most recent results
    result_type: 'recent',
    // returns english result
    lang: 'en'
}

// Create a Server
const app = express();
const proxy = httpProxy.createProxyServer({secure: false, ignorePath: true});
const server  = http.createServer(app);

// Proxy Http request
app.all('*', function(req, res) {
    var param = {
        q: '#' + req._parsedUrl.pathname,
        count: 10,
        result_type: 'recent',
        lang: 'en'
    }
    res.status(200).send("Tweets are in console")
    T.get('search/tweets', param, function(err, data, response){
        if(!err)
        {
            // loop through returned tweets
            for(let i = 0; i < data.statuses.length; i++)
            {
                // Get the tweet id from the returned data
                let id = {id: data.statuses[i].id_str}
                // Try to favorite the selected tweet
                T.post('favorites/create', id, function(err, response){
                    // if the favorite fails, log the error message
                    if(err)
                    {
                        console.log(err[0].message);
                        return;
                    }
                    // if the favorite is successful, log the url of the tweet
                    if(!err)
                    {
                        let username = response.user.screen_name;
                        let tweetId = response.id_str;
                        console.log('Favorited: ', `https://twitter.com/${username}/status/${tweetId}`)
                        //res.status(200).send("Favorited: " + `https://twitter.com/${username}/status/${tweetId}`)
                        return;
                    }
                });
            }
        }
        else
        {
            console.log(err);
        }
    })
});

server.listen(8080);
console.log('Proxy server running on port 8080');