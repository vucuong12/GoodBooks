const express = require('express')
const app = express()
var request = require('request');
var parseString = require('xml2js').parseString;
var cors = require('cors')
app.use(cors())

const port = 3000

app.get('/goodbooksindex/:bookname', (req, response) => {
	var bookName = req.params.bookname;
	// make the request
	request('https://www.goodreads.com/search/index.xml?q=' + bookName + '&key=xpsTLdwJ9BNBiFgTHkHVIQ', function (error, res, body) {
    if (!error && response.statusCode === 200) {      
       parseString(body, function (err, result) {
       	if (err) {
       		response.send({});
       		return;
       	}
       	try {
       		result = result.GoodreadsResponse.search[0].results[0].work[0].best_book[0];
       		console.log(result);
       		var book = {
       			title: result.title[0],
       			author: result.author.name,
       			image_url: result.image_url[0],
       			small_image_url: result.small_image_url[0]
       		};
	    	console.log(book);
	    	response.send(JSON.stringify(book));
       	} catch (error) {
       		return response.send({});
       	}
	});
    } else {
    	return response.send({});
    }
	});
});

app.get('/getrecommendedbooks/:bookname', (req, response) => {
	var bookName = req.params.bookname;
	// make the request
	request('https://tastedive.com/api/similar?q=book:' 
		+ bookName + '&type=books&k=321306-GoodBook-4K4RMEGV&info=1&limit=10', function (error, res, body) {
    if (!error && response.statusCode === 200) {      
    	return response.send(body);
    } else {
    	return response.send({});
    }
	});
});

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});



app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
