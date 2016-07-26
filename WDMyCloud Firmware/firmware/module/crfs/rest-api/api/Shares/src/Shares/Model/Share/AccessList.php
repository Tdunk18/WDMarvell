<?php

namespace Shares\Model\Share;

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * Description of Access
 *
 * @author gabbert_p
 */
class AccessList extends \ArrayIterator {

    public function append($value) {
        if (!$value instanceof Access) {
            $type = is_object($value) ? get_class($value) : gettype($value);
            throw new \Shares\Exception('Value must be of type "Access", type "' . $type . '" given.');
        }

        return parent::append($value);
    }

}

