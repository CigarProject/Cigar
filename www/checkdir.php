<?php

if (is_ajax()) {
	if (isset($_POST["action"]) && !empty($_POST["action"])) {
		$action = $_POST["action"];
		switch($action) {
			case "getSkins": getSkins(); break;
		}
	}
}

function is_ajax() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

function getSkins(){
	$images = glob('./skins/*.{png}', GLOB_BRACE);
	foreach ($images as &$path) {
		$path = basename($path,".png");
	}

	unset($path);
	$return["names"] = json_encode($images);
	echo json_encode($return);
}

?>
