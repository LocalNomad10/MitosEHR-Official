<?php
require_once("../registry.php");
?>
<HTML>
<HEAD>
<TITLE>OpenEMR v5</TITLE>
</HEAD>
<frameset rows="60%,35%" cols="*" name="Main" id="Main">
<?php if(true /* $_SESSION['userauthorized'] */ ) : ?>
  <frame src="main_info.php" name="Comment" scrolling="auto">
  <frame src="messages/messages.ejs.php" name="Authorization" id="Authorization" scrolling="auto">
<?php else: ?>
 <frame src="main_info.php" name="Comment" scrolling="auto">
 <frame src="calendar/find_patient.php?no_nav=1&mode=reset" name="fp" scrolling="auto">
<?php endif; ?>
</frameset>
<noframes><body bgcolor="#FFFFFF">
Frame support required
</body></noframes>
</HTML>
