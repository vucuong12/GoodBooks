var getBookFromGoodReads = function(bookName, callback) {
	$.ajax({
	  type: "GET",
	  url: "http://localhost:3000/goodbooksindex/" + bookName,
	  success: function(data){
	    callback(data);
	  },
	  error: function(err) {
	  	callback({});
	  }
	});
}

var getRecommendedBooks = function(bookName, callback) {
	$.ajax({
	  type: "GET",
	  url: "http://localhost:3000/getrecommendedbooks/" + bookName,
	  success: function(data){
	    callback(data);
	  },
	  error: function(err) {
	  	callback({});
	  }
	});
}



var addFavBook = function(userId, bookName) {
	getBookFromGoodReads(bookName, function(book) {
		console.log("---> ", book);
		if ($.isEmptyObject(book)) {
			return;
		}

		getRecommendedBooks(bookName, function(data) {
  		console.log("rec books");
  		data = JSON.parse(data);
  		//console.log(data);
  		//console.log(data.Similar);
  		var recBooks = data.Similar.Results;
  		// Add the new favourite book and the recommended books for the user
  		firebase.database().ref('/users/' + userId + "/favourite_book")
  		.push(book)
  		.then(function(bookRef) {
  			// Store the recommended books
		  	console.log("done storing a new favourite book !")
		  	for (var index in recBooks) {
		  		var recBook = recBooks[index]
		  		firebase.database().ref('/users/' + userId + "/recommended_book")
			  	.push(recBook)
		  		.then(function(bookRef) {
		  			// Store the recommended books
				  	console.log("done storing a new recommended book !")
				  }).catch(function(error) {
				    console.error('There was an error storing a new favourite book:', error);
				  });
		  	}
		  	
		  }).catch(function(error) {
		    console.error('There was an error storing a new favourite book:', error);
		  });
  	})
	})
}

addFavBook("tNXrgPTz8mRct1ezr7Ts7SBGjvq1", "1984");
addFavBook("tNXrgPTz8mRct1ezr7Ts7SBGjvq1", "harry potter");
