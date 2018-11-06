// Initialize Firebase
var config = {
  apiKey: "AIzaSyAzAIcCWeoIna96vmvoz0lYbIoOf74SH7A",
  authDomain: "goodbooks-619e8.firebaseapp.com",
  databaseURL: "https://goodbooks-619e8.firebaseio.com",
  projectId: "goodbooks-619e8",
  storageBucket: "goodbooks-619e8.appspot.com",
  messagingSenderId: "203399060877"
};
firebase.initializeApp(config);

var database = firebase.database();
var users = database.ref("users");