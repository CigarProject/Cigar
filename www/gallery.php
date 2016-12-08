<!DOCTYPE html>
<html>
<head>
    <title>Skins Gallery</title>
    <style type="text/css">
    .gallery {
        width: 64%;
        float: right;
    }
    li {
         list-style-type: none;
         margin-right: 10px;
         margin-bottom: 10px;
         float: left;
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
        background-size: 150px 150px;
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
    body {
        padding-top: 20px;
        padding-bottom: 20px;
    }
    </style>
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
