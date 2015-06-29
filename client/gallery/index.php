<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Gallery from Folder Demo</title>
<style type="text/css">
li{
	list-style-type:none;
	margin-right:10px;
	margin-bottom:10px;
	float:left;
}


.circular {
	width: 150px;
	height: 150px;
	border-radius: 75px;
	-webkit-border-radius: 75px;
	-moz-border-radius: 75px;
	background-repeat: no-repeat;
	box-shadow: 0 0 8px rgba(0, 0, 0, .8);
	-webkit-box-shadow: 0 0 8px rgba(0, 0, 0, .8);
	-moz-box-shadow: 0 0 8px rgba(0, 0, 0, .8);
	}

.circular img {
	opacity: 0;
	filter: alpha(opacity=0);
	}



.imgDescription {
	text-align: center;
  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(29, 106, 154, 0.72);
  color: #fff;
  visibility: hidden;
  opacity: 0;
  -webkit-transition: visibility opacity 0.2s;
}

.circular:hover .imgDescription {
  visibility: visible;
  opacity: 1;
}
</style></head>

<body>

<ul>
	<?php
		$dirname = "../skins/";
		$images = scandir($dirname);
		shuffle($images);
		$ignore = array(".", "..");
		foreach($images as $curimg){
			if(!in_array($curimg, $ignore)) {
				$name = pathinfo($curimg)['filename'];
				$curimg = str_replace(' ', '%20', $curimg);
				echo "<li><div class=\"circular\" style=' background-image: url(img.php?src=$dirname$curimg&w=150&h=150&zc=1)'><p class=\"imgDescription\">$name</p></div></li>\n ";
			}
		} 				
	?>
</ul>

</body>
</html>
