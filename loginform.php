<?php 

if($_SERVER["REQUEST_METHOD"]=="POST"){

  //retrievefrom data
  $username = $_POST['username'];
  $password = $_POST['password'];

  //database connection
  $host = "localhost:3307";
  $dbusername = "root";
  $dbpassword = "";
  $dbname = "auth1";

  $conn = new mysqli($host,$dbusername,$dbpassword,$dbname);

  if($conn->connect_error){
    die("Connection failed: ". $conn->connect_error);
  }
  if ( !isset($_POST['username'], $_POST['password']) ) {
    // Could not get the data that should have been sent.
    exit('Please fill both the username and password fields!');
  }
  //validate Login authentication
  $query = "SELECT *FROM login WHERE username='$username' AND password='$password'";

  $result = $conn->query($query);

  if($result->num_rows == 1){
    //login success
    header("Location: todo.html");
    exit();
  }
  else{
    //login failed
    echo 'Incorrect username and/or password. Try again.';
    exit();
  }

  $conn->close();

}

?>