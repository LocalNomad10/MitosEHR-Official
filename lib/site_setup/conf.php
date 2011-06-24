<?php
// *********************************************************
// MitosEHR Configuration file per site
// MySQL Config
// *********************************************************

//**********************************************************************
// Database Init Configuration
//**********************************************************************
$_SESSION['site']['db']['type'] = 'mysql';
$_SESSION['site']['db']['host'] = '%host%';
$_SESSION['site']['db']['port'] = '%port%';
$_SESSION['site']['db']['username'] = '%user%';
$_SESSION['site']['db']['password'] = '%pass%';
$_SESSION['site']['db']['database'] = '%db%';

//**********************************************************************
// AES Key
// 256bit - key
//**********************************************************************
$_SESSION['site']['AESkey'] = "%key%";

//**********************************************************************
// Setup Command
// If it's true, the application will
// run the Setup Wizard 
//**********************************************************************
$_SESSION['site']['setup'] = false;

?>