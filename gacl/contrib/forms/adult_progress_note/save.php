<?php
include_once("../../registry.php");
include_once("$srcdir/api.inc");

require ("C_FormAdultProgressNote.class.php");
$c = new C_FormAdultProgressNote();
echo $c->default_action_process($_POST);
@formJump();
?>
