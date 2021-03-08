<?php
if (isset($_FILES["file"])) {

  if ($_FILES["file"]["error"]!=0) {
    echo("Probleem (2) bij het lezen van het bestand <pre>");
    print_r($_FILES["file"]);
    die();
  }

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
  } else {
    die("Probleem (1) bij het lezen van het bestand (let op dat het bestand niet begint met een lege regel)");
  }
}

?>
<h1>MDWS Uitvoer converteren</h1>
<form action="?" method="post" enctype="multipart/form-data">
<label for="file">Selecteer een 'Uitvoer-voor-MDWS.txt' bestand:</label><br><br>
<input required accept=".txt" type="file" id="file" name="file"><br><br>
<input type="submit" value="Converteer naar CSV">
</form>