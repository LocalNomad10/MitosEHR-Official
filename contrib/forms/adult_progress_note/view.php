<?php
include_once("../../registry.php");
include_once("$srcdir/api.inc");

require ("C_FormAdultProgressNote.class.php");

$c = new C_FormAdultProgressNote();
echo $c->view_action($_GET['id']);
?>
