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
var user = {};
var updateBooksOnUserPage = function(user) {
	$("#fav_books").empty();
	$("#rec_books").empty();
	var bookTemplate = $("#book_template");
	database.ref("/users/" + user.uid + "/favourite_book").once('value', function(snapshot) {
		if (!snapshot.val()) return;
		var keys = Object.keys(snapshot.val());
		var books = [];
	  for (var index = 0; index < keys.length; index++){
	    var key = keys[index];
	    var book = JSON.parse(snapshot.val()[key]);
	    var exist = false;
	    for (var i in books) {
	    	if (books[i].title == book.title) {
	    		exist = true;
	    		break;
	    	}
	    }
	    if (!exist) {
	    	books.push(book);
	    }
	  }
	  for (var i in books) {
	  	
	  	var book=bookTemplate.clone();
	  	console.log("====> ", books[i], books[i].image_url)
			book.find('.title').html(books[i].title);
			book.find('.book_image').attr('src', books[i].small_image_url);
			book.find('.goodreads_url').attr("href", "https://www.goodreads.com/book/show/" + books[i].goodreads_id).attr("target", "_blank");
			
			book.appendTo('#fav_books');

			book.show();
	  }
	})

	database.ref("/users/" + user.uid + "/recommended_book").once('value', function(snapshot) {
		if (!snapshot.val()) return;
		var keys = Object.keys(snapshot.val());
		var books = [];
	  for (var index = 0; index < keys.length; index++){
	    var key = keys[index];
	    var book = JSON.parse(snapshot.val()[key]);
	    var exist = false;
	    for (var i in books) {
	    	console.log("!!!!!   ", books[i])
	    	if (books[i].title == book.title) {
	    		exist = true;
	    		break;
	    	}
	    }
	    if (!exist) {
	    	books.push(book);
	    }
	  }
	  for (var i in books) {
	  	
	  	var book=bookTemplate.clone();
	  	console.log("====> ", books[i], books[i].image_url)
			book.find('.title').html(books[i].title);
			book.find('.book_image').attr('src', books[i].small_image_url);
			book.appendTo('#rec_books');
			book.show();
	  }
	})
}

firebase.auth().onAuthStateChanged(function(currentUser) {
	user = currentUser;
	console.log("===> user changed = ", user)
	if (!user) {
		return;
	}
	

	updateBooksOnUserPage(user);

	$("#add_button").click(function(){
	    var book_name = $("#added_fav_book").val();
	    addFavBook(user.uid, book_name);
	});
})


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
  			updateBooksOnUserPage(user)
  			// Store the recommended books
		  	console.log("done storing a new favourite book !")
		  	for (var index in recBooks) {
		  		var recBook = recBooks[index]
		  		getBookFromGoodReads(recBook.Name, function(book) {
						if ($.isEmptyObject(book)) {
							return;
						}
						firebase.database().ref('/users/' + userId + "/recommended_book")
				  	.push(book)
			  		.then(function(bookRef) {
			  			// Store the recommended books
					  	console.log("done storing a new recommended book !")
					  	updateBooksOnUserPage(user);
					  }).catch(function(error) {
					    console.error('There was an error storing a new favourite book:', error);
					  });
					});
		  	}
		  	
		  }).catch(function(error) {
		    console.error('There was an error storing a new favourite book:', error);
		  });
  	})
	})
}


//addFavBook("6DO6aajHfiO7P8wKF4D1Xxf4UcF2", "1984");
//addFavBook("6DO6aajHfiO7P8wKF4D1Xxf4UcF2", "harry potter");
