<?php

session_start();

    $postData = file_get_contents("php://input");
    $request = json_decode($postData);

    print($request)



exit;
?>