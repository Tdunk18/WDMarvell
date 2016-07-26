<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model\Album;

/**
 * Description of ItemList
 *
 * @author gabbert_p
 */
class AccessList extends \ArrayIterator {

    public function append($value) {
        if (!$value instanceof Item) {
            throw new \Albums\Exception(sprintf('Value must be of type "Album\Access", type "%s" given.', (is_object($value) ? get_class($value) : gettype($value))));
        }

        return parent::append($value);
    }
}

