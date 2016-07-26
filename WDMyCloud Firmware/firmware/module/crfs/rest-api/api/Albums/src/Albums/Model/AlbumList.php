<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model;

/**
 * Description of AlbumList
 *
 * @author gabbert_p
 */
class AlbumList extends \ArrayIterator  {

    public function append($value) {
        if (!$value instanceof Album) {
            throw new \Share\Exception(sprintf('Value must be of type "Album", type "%s" given.', (is_object($value) ? get_class($value) : gettype($value))));
        }

        return parent::append($value);
    }

}

