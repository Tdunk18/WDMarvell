<?php

namespace Shares\Model\Share;
/**
 * Share Access level enumeration
 * @author sapsford_j
 */

abstract class AccessLevel {
	
	const READ_WRITE = 'RW';
	const READ_ONLY = 'RO';
	const NOT_AUTHORIZED = 'NA';

}