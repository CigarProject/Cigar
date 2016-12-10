<!DOCTYPE html>
<html>
<head>
    <title>Skins Gallery</title>
    <link href="assets/css/gallery.css" rel="stylesheet">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="row">
            <ul>
                <?php
                    $dirname = "skins/";
                    $images = scandir($dirname);
                    $ignore = array(".", "..");
                    foreach($images as $curimg) {
                        if (!in_array($curimg, $ignore) && strtolower(pathinfo($curimg, PATHINFO_EXTENSION)) == "png") {
                            ?>
                            <li>
                                <div class="circular" style='background-image: url("./<?php echo $dirname.$curimg ?>")'></div>
                                <h4 style="text-align: center"><?php echo pathinfo($curimg, PATHINFO_FILENAME); ?></h4>
                            </li>
                            <?php
                        }
                    }                 
                ?>
            </ul>
        </div>
    </div>
</body>
</html>
