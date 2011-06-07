<?php
//--------------------------------------------------------------------------------------------------------------------------
// data_update.ejs.php
// v0.0.2
// Under GPLv3 License
//
// Integrated by: GI Technologies Inc. in 2011
//
// Remember, this file is called via the Framework Store, this is the AJAX thing.
//--------------------------------------------------------------------------------------------------------------------------

session_name ( "MitosEHR" );
session_start();
session_cache_limiter('private');

include_once("../../../library/dbHelper/dbHelper.inc.php");
include_once("../../../library/I18n/I18n.inc.php");
require_once("../../../repository/dataExchange/dataExchange.inc.php");

//******************************************************************************
// Reset session count 10 secs = 1 Flop
//******************************************************************************
$_SESSION['site']['flops'] = 0;

$mitos_db = new dbHelper();

// *************************************************************************************
// Parce the data generated by EXTJS witch is JSON
// *************************************************************************************
$data = json_decode ( $_REQUEST['row'] );

// *************************************************************************************
// Validate and pass the POST variables to an array
// This is the moment to validate the entered values from the user
// although Sencha EXTJS make good validation, we could check again 
// just in case 
// *************************************************************************************
$row['item_id'] 		= trim($data->item_id);
$row['form_id'] 		= $data->form_id;
$row['field_id'] 		= $data->field_id;
$row['group_name'] 		= $data->group_name;
$row['title'] 			= $data->title;
$row['seq'] 			= $data->seq;
$row['data_type'] 		= $data->data_type;
$row['uor'] 			= $data->uor;
$row['fld_length'] 		= $data->fld_length;
$row['max_length'] 		= $data->max_length;
$row['list_id'] 		= $data->list_id;
$row['titlecols'] 		= $data->titlecols;
$row['datacols'] 		= $data->datacols;
$row['default_value'] 	= $data->default_value;
$row['edit_options'] 	= $data->edit_options;
$row['description'] 	= $data->description;
$row['group_order'] 	= $data->group_order;

// *************************************************************************************
// Finally that validated POST variables is inserted to the database
// This one make the JOB of two, if it has an ID key run the UPDATE statement
// if not run the INSERT stament
// *************************************************************************************
$sql = $mitos_db->sqlBind($row, "layout_options", "U", "item_id='" . $row['item_id'] . "'");
$mitos_db->setSQL($sql);
$ret = $mitos_db->execLog();

if ( $ret == "" ){
	echo '{ success: false, errors: { reason: "'. $ret[2] .'" }}';
} else {
	echo "{ success: true }";
}

?>