<?php
include_once("../../registry.php");
include_once("$srcdir/api.inc");

require ("C_FormWellChild.class.php");

$c = new C_FormWellChild();
echo $c->default_action();

?>
