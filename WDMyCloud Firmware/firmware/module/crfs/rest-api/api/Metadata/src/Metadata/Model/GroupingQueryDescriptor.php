<?php
/**
 * The \Metadata\Model\GroupingQueryDescriptor class file.
 */

namespace Metadata\Model;

/**
 * The \Metadata\Model\GroupingQueryDescriptor class.
 *
 * Encapsulates the parameters used when performing metadb_group queries so the functional code is simpler.
 */
class GroupingQueryDescriptor
{
    /**
     * The name of the share to execute queries against.
     *
     * @var string
     */
    protected $_shareName;
    /**
     * The id of the group type for determining how to search for metadata.
     *
     * @var int
     * @see getGroupingInfos()
     */
    protected $_groupingId;
    /**
     * Whether or not there are multiple columns to select/sort by. This is determined by the grouping id.
     *
     * @var bool
     */
    protected $_isTwoLevel;
    /**
     * The value to filter the result set against.
     *
     * @var string
     */
    protected $_filterValue;
    /**
     * Whether or not the sort is in ascending order.
     *
     * @var bool
     */
    protected $_isAscending;
    /**
     * Row offset for pagination.
     *
     * @var int
     */
    protected $_rowOffset;
    /**
     * Number of rows to return for pagination.
     *
     * @var int
     */
    protected $_rowCount;

    /**
     * Encapsulates the parameters used when performing metadb_group queries so the functional code is simpler.
     *
     * @param string $shareName The name of the share to execute queries against.
     * @param int $groupingId The id of the group type for determining how to search for metadata.
     * @param bool $isTwoLevel Whether or not there are multiple columns to select/sort by. This is determined by the
     *                         grouping id.
     * @param string $filterValue The value to filter the result set against.
     * @param bool $isAscending Whether or not the sort is in ascending order.
     * @param int $rowOffset Row offset for pagination.
     * @param int $rowCount Number of rows to return for pagination.
     */
	public function __construct($shareName, $groupingId, $isTwoLevel, $filterValue, $isAscending, $rowOffset, $rowCount)
    {
        $this->_shareName   = $shareName;
        $this->_groupingId  = $groupingId;
        $this->_isTwoLevel  = $isTwoLevel;
        $this->_filterValue = $filterValue;
        $this->_isAscending = $isAscending;
        $this->_rowOffset   = $rowOffset;
        $this->_rowCount    = $rowCount;
    }

    /**
     * Returns the name of the share to execute queries against.
     *
     * @return string
     */
    public function getShareName()
    {
        return $this->_shareName;
    }

    /**
     * Returns the id of the group type for determining how to search for metadata.
     *
     * @return int
     */
    public function getGroupingId()
    {
        return $this->_groupingId;
    }

    /**
     * Returns whether or not there are multiple columns to select/sort by. This is determined by the grouping id.
     *
     * @return boolean
     */
    public function getIsTwoLevel()
    {
        return $this->_isTwoLevel;
    }

    /**
     * Returns the value to filter the result set against.
     *
     * @return string
     */
    public function getFilterValue()
    {
        return $this->_filterValue;
    }

    /**
     * Returns whether or not the sort is in ascending order.
     *
     * @return boolean
     */
    public function getIsAscending()
    {
        return $this->_isAscending;
    }

    /**
     * Returns the row offset for pagination.
     *
     * @return int
     */
    public function getRowOffset()
    {
        return $this->_rowOffset;
    }

    /**
     * Returns the number of rows to return for pagination.
     *
     * @return int
     */
    public function getRowCount()
    {
        return $this->_rowCount;
    }
}