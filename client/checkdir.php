<?php
//test_function();

if (is_ajax()) {
  if (isset($_POST["action"]) && !empty($_POST["action"])) { //Checks if action value exists
    $action = $_POST["action"];
    switch($action) { //Switch case for value of action
      case "test": test_function(); break;
    }
  }
}

//Function to check if the request is an AJAX request
function is_ajax() {
  return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}


function test_function(){
  $return = $_POST;

#echo "Hello world!";
$images = glob('./skins/*.{png}', GLOB_BRACE);
//print_r($images);
foreach ($images as &$path) {
$path = basename($path,".png");
}

unset($path);

#print_r($images);
$return["names"] = json_encode($images);

$return["json"] = json_encode($return);
#print_r($return);
#echo json_encode($images);
echo json_encode($return);
}
?>
