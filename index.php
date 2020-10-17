<?php
if (isset($_FILES["file"]) && $_FILES["file"]["error"]==0) {

  $basename = str_replace(".txt","",$_FILES["file"]["name"]);
  $tmpfile = $_FILES["file"]["tmp_name"];
  $fp = fopen($tmpfile, 'r');
  $data = fread($fp, 2);
  fclose($fp);

  if ($data=="%0") {
    header("Content-type: text/csv");
    header("Content-disposition: attachment; filename=$basename.csv");
    passthru("./mdws2json.js < $tmpfile | ./json2csv.py | uconv -f utf-8 -t utf-8 --add-signature");
    die();
  }
}

?>
<h1>MDWS Uitvoer converteren</h1>
<form action="?" method="post" enctype="multipart/form-data">
<label for="file">Selecteer een 'Uitvoer-voor-MDWS.txt' bestand:</label><br><br>
<input required accept=".txt" type="file" id="file" name="file"><br><br>

<!-- Download als:<br><br> -->
<!-- <input type="submit" value="JSON"> -->
<input type="submit" value="Converteer naar CSV">
</form>