<?php
//--------------------------------------------------------------------------------------------------------------------------
// data_destroy.ejs.php / List Options
// v0.0.1
// Under GPLv3 License
//
// Integrated by: Gi Technologies. in 2011
//
// Remember, this file is called via the Framework Store, this is the AJAX thing.
//--------------------------------------------------------------------------------------------------------------------------

// *************************************************************************************
//SANITIZE ALL ESCAPES
// *************************************************************************************
$sanitize_all_escapes=true;

// *************************************************************************************
//STOP FAKE REGISTER GLOBALS
// *************************************************************************************
$fake_register_globals=false;

// *************************************************************************************
// Load the OpenEMR Libraries
// *************************************************************************************
require_once("../../registry.php");

// *************************************************************************************
// Flag the list item to delete
// *************************************************************************************
$data = json_decode ( $_POST['row'] );
$delete_id = $data[0]->id;

sqlStatement("DELETE FROM list_options WHERE id='$delete_id'"); 

?>