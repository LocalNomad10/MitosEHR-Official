<?php
if(!isset($_SESSION)) {
	session_name('MitosEHR');
	session_start();
	session_cache_limiter('private');
}
include_once($_SESSION['site']['root'] . '/classes/dbHelper.php');
include_once($_SESSION['site']['root'] . '/dataProvider/Patient.php');
/**
 * @brief       Services Class.
 * @details     This class will handle all services
 *
 * @author      Ernesto J. Rodriguez (Certun) <erodriguez@certun.com>
 * @version     Vega 1.0
 * @copyright   Gnu Public License (GPLv3)
 *
 */


class PreventiveCare
{
	/**
	 * @var dbHelper
	 */
	private $db;

    /**
	 * @var Patient
	 */
	private $patient;


	function __construct()
	{
		$this->db = new dbHelper();
		$this->patient = new Patient();
	}

	/******************************************************************************************************************/
	/**** PUBLIC METHODS || PUBLIC METHODS || PUBLIC METHODS || PUBLIC METHODS || PUBLIC METHODS || PUBLIC METHODS ****/
	/******************************************************************************************************************/

	/**
	 * get preventive care guideline by category id
	 * @param stdClass $params
	 * @return array
	 */
	public function getGuideLinesByCategory(stdClass $params){
        $records = array();
        if($params->category_id == 'dismiss'){
            $this->db->setSQL("SELECT *
                           FROM preventive_care_inactive_patient");
            $records =$this->db->fetchRecords(PDO::FETCH_CLASS);
        }else{
                $this->db->setSQL("SELECT * FROM preventive_care_guidelines WHERE category_id = '$params->category_id'");
              $records =$this->db->fetchRecords(PDO::FETCH_CLASS);
        }
      return $records ;
	}
	/**
	 * update preventive care guideline by category id
	 * @param stdClass $params
	 * @return stdClass
	 */
	public function addGuideLine(stdClass $params){
		$data = get_object_vars($params);
		unset($data['id']);
		$this->db->setSQL($this->db->sqlBind($data,'preventive_care_guidelines','I'));
		$this->db->execLog();
		$params->id = $this->db->lastInsertId;
		return $params;
	}
	/**
	 * update preventive care guideline by category id
	 * @param stdClass $params
	 * @return stdClass
	 */
	public function updateGuideLine(stdClass $params){
		$data = get_object_vars($params);
		unset($data['id']);
		$this->db->setSQL($this->db->sqlBind($data, 'preventive_care_guidelines', 'U', "id='$params->id'"));
		$this->db->execLog();
		return $params;
	}
	/**
	 * get guideline active problem by guideline id
	 * @param stdClass $params
	 * @return \stdClass
	 */
	public function getGuideLineActiveProblems(stdClass $params){
		$active_problems = array();
		$foo = explode(';',$this->getCodes($params->id,'active_problems'));
		if($foo[0]){
			foreach($foo as $fo){
				$this->db->setSQL("SELECT code, code_text FROM codes_icds WHERE code = '$fo' AND code IS NOT NULL");
				$problem = $this->db->fetchRecord(PDO::FETCH_ASSOC);
				$problem['guideline_id'] = $params->id;
				$active_problems[] = $problem;
			}
		}
		return $active_problems;
	}
	/**
	 * @param $params
	 * @return mixed
	 */
	public function addGuideLineActiveProblems($params){
		if(is_array($params)){
			foreach($params as $p){
				$this->addCode($p->guideline_id,$p->code,'active_problems');
			}
		}else{
			$this->addCode($params->guideline_id,$params->code,'active_problems');
		}
		return $params;
	}
	/**
	 * @param stdClass $params
	 * @return stdClass
	 */
	public function removeGuideLineActiveProblems($params){
		if(is_array($params)){
			foreach($params as $p){
				$this->removeCode($p->guideline_id,$p->code,'active_problems');
			}
		}else{
			$this->removeCode($params->guideline_id,$params->code,'active_problems');
		}
		return $params;
	}
	/**
	 * get guideline medications by guideline id
	 * @param stdClass $params
	 * @return \stdClass
	 */
	public function getGuideLineMedications(stdClass $params){
		$medications = array();
		$foo = explode(';',$this->getCodes($params->id,'medications'));
		if($foo[0]){
			foreach($foo AS $fo){
				$this->db->setSQL("SELECT PRODUCTNDC AS code,
										  CONCAT(PROPRIETARYNAME,
										  ' (',ACTIVE_NUMERATOR_STRENGTH,') ',
										  ACTIVE_INGRED_UNIT) AS code_text
								     FROM medications
								    WHERE id = '$fo' AND code IS NOT NULL");
				$medication = $this->db->fetchRecord(PDO::FETCH_CLASS);
				$medication['guideline_id'] = $params->id;
				$medications[] = $medication;
			}
		}
		return $medications;
	}
	/**
	 * @param stdClass $params
	 * @return stdClass
	 */
	public function addGuideLineMedications($params){
		if(is_array($params)){
			foreach($params as $p){
				$this->addCode($p->guideline_id,$p->code,'medications');
			}
		}else{
			$this->addCode($params->guideline_id,$params->code,'medications');
		}
		return $params;
	}
	/**
	 * @param stdClass $params
	 * @return stdClass
	 */
	public function removeGuideLineMedications($params){
		if(is_array($params)){
			foreach($params as $p){
				$this->removeCode($p->guideline_id,$p->code,'medications');
			}
		}else{
			$this->removeCode($params->guideline_id,$params->code,'medications');
		}
		return $params;
	}

	/******************************************************************************************************************/
	/* PRIVATE METHODS || PRIVATE METHODS || PRIVATE METHODS || PRIVATE METHODS || PRIVATE METHODS || PRIVATE METHODS */
	/******************************************************************************************************************/

	/**
	 * @param $id
	 * @param $codeColumn
	 * @return mixed
	 */
	private function getCodes($id, $codeColumn){
		$this->db->setSQL("SELECT $codeColumn FROM preventive_care_guidelines WHERE id = '$id' AND $codeColumn IS NOT NULL");
		$foo = $this->db->fetchRecord(PDO::FETCH_CLASS);
		return $foo[$codeColumn];
	}
	/**
	 * @param $id
	 * @param $code
	 * @param $codeColumn
	 * @return mixed
	 */
	private function removeCode($id, $code, $codeColumn){
		$codes = explode(';',$this->getCodes($id,$codeColumn));
		$key = array_search($code, $codes);
		if($key !== false) unset($codes[$key]);
		if(!empty($codes)){
			$codes = implode(';',$codes);
			$data[$codeColumn] = $codes;
		}else{
			$data[$codeColumn] = null;
		}
		$this->db->setSQL($this->db->sqlBind($data,'preventive_care_guidelines','U',"id='$id'"));
		$this->db->execLog();
		return;
	}
	/**
	 * @param $id
	 * @param $code
	 * @param $codeColumn
	 * @return mixed
	 */
	private function addCode($id, $code, $codeColumn){
		$codes = explode(';',$this->getCodes($id,$codeColumn));
		if(!$codes[0]){
			$data[$codeColumn] = $code;
		}else{
			$codes[] = $code;
			$codes = implode(';',$codes);
			$data[$codeColumn] = $codes;
		}
		$this->db->setSQL($this->db->sqlBind($data,'preventive_care_guidelines','U',"id='$id'"));
		$this->db->execLog();
		return;
	}



    public function checkAge($pid, $immu_id){

        $DOB= $this->patient->getPatientDOBByPid($pid);
        $age = $this ->patient->getPatientAgeByDOB($DOB);
        $range = $this->getPreventiveCareAgeRangeById($immu_id);
        if( $age['years'] >= $range['age_start'] && $age['years'] <= $range['age_end']){
           return true;
        }
        else{
           return false;
        }
    }
    public function checkSex($pid, $immu_id){

        $pSex = $this->patient->getPatientSexByPid($pid);

        $iSex = $this->getPreventiveCareSexById($immu_id);
        if($iSex == $pSex){
            return true;
        }else if($iSex=='Both'){
            return true;
        }
        else{
            return false;
        }
    }
    public function checkPregnant($pid, $immu_id){

        $ppreg =  $this->patient->getPatientPregnantStatusByPid($pid);
        $ipreg =  $this->getPreventiveCarePregnantById($immu_id);

        if($ppreg == $ipreg){
            return true;
        }
        else{
            return false;
        }

    }
    public function checkProblem($pid,$preventiveId){

       $check= $this->checkMedicationProblemLabs($pid,$preventiveId,'patient_issues','active_problems');
        if($check){
            return true;

        }else{
            return false;
        }

    }
    public function checkMedications($pid,$preventiveId){

       $check= $this->checkMedicationProblemLabs($pid,$preventiveId,'patient_medications','medications');
        if($check){
            return true;

        }else{
            return false;
        }

    }

    public function checkMedicationProblemLabs($pid,$preventiveId,$tablexx,$column){

        $preventiveProblems = $this->getPreventiveCareActiveProblemsById($preventiveId);
        $preventiveProblems = explode(';',$preventiveProblems[$column]);
        $patientProblems = $this->patient->getPatientActiveProblemsById($pid,$tablexx);
        $checking = array();
        $size = sizeof($preventiveProblems);
        foreach($preventiveProblems as $prob){
            foreach($patientProblems as $patient){
                if ($prob==$patient['title']){
                    $checking[$patient['title']]=true;

                }
            }
        }
        if($size == sizeof($checking) || $preventiveProblems[0] == '' ){
            return true;
        }
        else{

            return false;
        }

    }

    public function getPreventiveCarePregnantById($id){
        $this->db->setSQL("SELECT pregnant
                           FROM preventive_care_guidelines
                           WHERE id='$id'");
        $u = $this->db->fetchRecord(PDO::FETCH_ASSOC);
        return $u['pregnant'];
    }
    public function getPreventiveCareSexById($id){
        $this->db->setSQL("SELECT sex
                           FROM preventive_care_guidelines
                           WHERE id='$id'");
        $u = $this->db->fetchRecord(PDO::FETCH_ASSOC) ;

        if($u['sex']==1){
            $sex='Male';
        }else if($u['sex']==2){
            $sex='Female';
        }else{
            $sex='Both';
        }

        return $sex;
    }
    public function getPreventiveCareActiveProblemsById($id){
        $this->db->setSQL("SELECT *
                           FROM preventive_care_guidelines
                           WHERE id='$id'");
        return $this->db->fetchRecord(PDO::FETCH_ASSOC);

    }
    public function getPreventiveCareAgeRangeById($id){
        $this->db->setSQL("SELECT age_start,
                                  age_end
                           FROM preventive_care_guidelines
                           WHERE id='$id'");
        return $this->db->fetchRecord(PDO::FETCH_ASSOC);
    }

    public function activePreventiveCareAlert($params){
        $alerts=$this->getPreventiveCareCheck($params);
        if(sizeof($alerts)>='0' && $alerts[0]!=''){
            return array('success' => true);
        }else{
            return array('success' => false);
        }
    }

    public function checkForDismiss($pid){

        $this->db->setSQL("SELECT *
                           FROM preventive_care_inactive_patient
                           WHERE pid='$pid'");
        return $this->db->fetchRecords(PDO::FETCH_ASSOC);

    }

    public function getPreventiveCareCheck(stdClass $params){
        $this->db->setSQL("SELECT * FROM preventive_care_guidelines");
        $patientAlerts = array();
        foreach($this->db->fetchRecords(PDO::FETCH_ASSOC) as $rec){
            $rec['alert'] = ($this->checkAge($params->pid, $rec['id'])
                          && $this->checkSex($params->pid, $rec['id'])
                          && $this->checkProblem($params->pid, $rec['id'])
                          && $this->checkMedications($params->pid, $rec['id'])) ? true : false ;
            if($rec['category_id']==3){
                $rec['type']='Immunizations';
            }else if($rec['category_id']==4){
                $rec['type']='Laboratory Test';
            }else if($rec['category_id']==1516){
                $rec['type']='Diagnostic Test';
            }else if($rec['category_id']==1517){
                $rec['type']='Disease Management';
            }else if($rec['category_id']==1518){
                $rec['type']='Pedriatic Vaccines';
            }else{
                $rec['type']='Uncategorized';
            }


//            && $this->checkPregnant($params->pid, $rec['id'])
            if($rec['alert'] && $rec['active'] ){
                $patientAlerts[]= $rec;

            }

        }

        $patientDismissedAlerts = $this->checkForDismiss($params->pid);

        $count = 0;
        foreach($patientAlerts as $patientAlert){
            foreach($patientDismissedAlerts as $patientDismissedAlert){
                if($patientDismissedAlert['preventive_care_id'] == $patientAlert['id'] ){
                    unset($patientAlerts[$count]);
                }
            }
            $count++;
        }

        return array_values($patientAlerts);
    }

    public function addPreventivePatientDismiss(stdClass $params){

        $data = get_object_vars($params);
        unset($data['description'],$data['type'],$data['alert']);
        $data['preventive_care_id'] = $data['id'];
        $data['pid'] = $_SESSION['patient']['pid'];
        $data['uid'] = $_SESSION['user']['id'];
        unset($data['id']);
        $this->db->setSQL($this->db->sqlBind($data, 'preventive_care_inactive_patient', 'I'));
        $this->db->execLog();
        $params->id = $this->db->lastInsertId;
        return array('totals'=> 1, 'rows'  => $params);


    }

}
////
//$params = new stdClass();
//$params->start = 0;
//$params->limit = 25;
//$params->pid = 1;
//$t = new PreventiveCare();
//print '<pre>';
//print_r($t->getPreventiveCareCheck($params));

//print_r($t->checkAge(1,9));
