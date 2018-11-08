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
var targetuser = {}

var updateBooksOnUserPage = function(uid) {
	$("#fav_books").empty();
	$("#rec_books").empty();
	var bookTemplate = $("#book_template");
	database.ref("/users/" + uid + "/favourite_book").once('value', function(snapshot) {
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

	database.ref("/users/" + uid + "/recommended_book").once('value', function(snapshot) {
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
	$("#myUserpage").attr("href", "userpage.html?uid="+ currentUser.uid)
	user = currentUser;

	var uid_param = getParameterByName("uid");
	if (uid_param != user.uid) {
		$("#search_section").hide();
	} else {
		$("#search_section").show();
	}
	

	firebase.database().ref('users/' + currentUser.uid).once('value').then(function(snapshot) {
	  var tmp_user = snapshot.val() || 'Anonymous';

	  firebase.database().ref('users/' + uid_param).once('value').then(function(snapshot) {
	  	targetuser = snapshot.val() || 'Anonymous';

	  	// Starttttttt -----
	  	$("#user_full_name").html(targetuser.first_name + " " + targetuser.surname);
	  	console.log("====> followingnnnnn", targetuser.following)
			//show following users
			for (var key in targetuser.following) {
				var following_user = targetuser.following[key];
				var afollowing = $('<a></a>');
				afollowing.attr("href", "userpage.html?uid=" + following_user.uid).html(following_user.first_name + " " + following_user.surname)
				//afollowing.appendTo($("#following_list"));
				var adiv = $('<div></div>').append(afollowing);
				adiv.appendTo($("#following_list"));
			}
	  })

	  // console.log("This is a user ", tmp_user.following);
	  if (uid_param != user.uid) {
	  	var check = false;
	  	for (var key in tmp_user.following) {
	  		if (tmp_user.following[key].uid == uid_param) {
	  			check = true;
	  		}
	  		// if (tmp_user.following[key].uid) {
	  		// 	$("#user_full_name").html(tmp_user.first_name + " " + tmp_user.surname);
	  		// }
	  	}
			if (!check) $("#follow_button").show();
		}
		updateBooksOnUserPage(uid_param);
	});

	console.log("===> user changed = ", user.uid)
	if (!user) {
		return;
	}

	

	$("#add_button").click(function(){
	    var book_name = $("#added_fav_book").val();
	    document.getElementById("myGif").style.display = "block";
	    addFavBook(user.uid, book_name);
	});

	$("#follow_button").click(function(){
	    follow_user(user.uid, uid_param);
	});
})

var follow_user = function (userA, userB) {
	firebase.database().ref('users/' + userB).once('value').then(function(snapshot) {
	  var an_user = snapshot.val() || 'Anonymous';
	  an_user.uid = userB;
	  firebase.database().ref('/users/' + userA + "/following")
		.push(an_user)
		.then(function(userRef) {
			// Store the recommended books
	  	console.log("done storing a new following !")
	  	$("#follow_button").hide();
	  }).catch(function(error) {
	    console.error('There was an error storing a new favourite book:', error);
	  });
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
  			updateBooksOnUserPage(user.uid)
  			// Store the recommended books
		  	console.log("done storing a new favourite book !")
		  	var i = 0
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
					  	i+=1;
					  	if (i == recBooks.length){
					  		updateBooksOnUserPage(user.uid);
					  		document.getElementById("myGif").style.display = "none";
					  	}
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

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


//addFavBook("6DO6aajHfiO7P8wKF4D1Xxf4UcF2", "1984");
//addFavBook("6DO6aajHfiO7P8wKF4D1Xxf4UcF2", "harry potter");
