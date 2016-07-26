<?php

/**
 * \file filesystem\dir.inc \author WDMV - Mountain View - Software Engineering \copyright Copyright (c) 2012, Western
 * Digital Corp. All rights reserved.
 */
function getAttributes($path, $requestPath, $file = NULL, $includePermissions = NULL, $includeDirCount = NULL,
    $includeHidden = FALSE, $showIsLinked = FALSE)
{
    $fullname = $path;

    if (isset($file))
    {
        $fullname .= '/' . $file;
    }

    $fullPath = \Filesystem\Model\SharePathObject::createFromAbsolutePath($fullname);

    // use a special function to deal with over 2 Gb files and to simplify getting permnissions
    $fstat = fstatLfs($fullname, $includePermissions);

    if ($fullPath->isDir())
    {
        $attributes['is_dir'] = ['TYPE' => 'STRING', 'VALUE' => 'true'];
    }
    elseif (!$fullPath->isFile())
    {
        return FALSE; // if file does not exist return false
    }
    else
    {
        $attributes['is_dir'] = ['TYPE' => 'STRING', 'VALUE' => 'false'];
        $attributes['size']   = ['TYPE' => 'NUMBER', 'VALUE' => $fstat['size']];
    }

    if ($includeDirCount)
    {
        $attributes['dir_count']['TYPE'] = 'NUMBER';

        // if this is not a directory dir_count is 0
        // parameter GLOB_ONLYDIR only accounts for directories
        // two different cases for counting dsub-directories: when hidden files are not included we do not include
        // hidden sub-directories
        // when hidden files are requested we count both visible and hidden subdirectories
        // when requesting hidden files we subtract 2 to account for '.' and '..'
        if (!$fullPath->isDir())
        {
            $attributes['dir_count']['VALUE'] = 0;
        }
        else
        {
            if (strpos($fullname, '[') !== FALSE)
            {
                $fullname = str_replace('[', '\[', $fullname);
            }

            if (strpos($fullname, ']') !== FALSE)
            {
                $fullname = str_replace(']', '\]', $fullname);
            }

            if ($includeHidden)
            {
                $attributes['dir_count']['VALUE'] = count(glob($fullname . '/*', GLOB_ONLYDIR)) +
                                                    count(glob($fullname . '/{.}*', GLOB_BRACE | GLOB_ONLYDIR)) - 2;
            }
            else
            {
                $attributes['dir_count']['VALUE'] = count(glob($fullname . '/*', GLOB_ONLYDIR));
            }
        }
    }

    // Keeping rtrim because request might come from ../<sharename> or ../<sharename>/
    $attributes['path'] = ['TYPE' => 'STRING', 'VALUE' => rtrim($requestPath, '/')];

    if (isset($file))
    {
        $attributes['name'] = ['TYPE' => 'STRING', 'VALUE' => $file];
    }

    $attributes['mtime'] = ['TYPE' => 'NUMBER', 'VALUE' => $fstat['mtime']];

    if ($includePermissions)
    {
        foreach ($fstat as $fstatK => $fstatV)
        {
            if (!isset($attributes[$fstatK]) && ($fstatK !== 'size'))
            {
                $attributes[$fstatK] = ['TYPE' => 'STRING', 'VALUE' => $fstatV];
            }
        }

        $fstat              = @lstat($fullname);
        $mode               = is_array($fstat) && isset($fstat['mode']) ? $fstat['mode'] : '';
        $attributes['mode'] = ['TYPE' => 'NUMBER', 'VALUE' => $mode];
    }

    if ($showIsLinked) {
        $map = \Filesystem\Model\Link::getMapFromTarget($requestPath, TRUE, FALSE, TRUE);
        $attributes['is_linked'] = ['TYPE' => 'STRING', 'VALUE' => empty($map) ? 'false' : 'true'];
    }

    return $attributes;
}