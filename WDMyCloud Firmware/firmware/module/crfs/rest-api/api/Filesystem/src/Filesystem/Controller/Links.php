<?php

namespace Filesystem\Controller;

/**
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
require_once COMMON_ROOT . 'includes' . DS . 'requestscope.inc';
require_once COMMON_ROOT . 'includes' . DS . 'security.inc';

use Filesystem\Model;

/**
 * \class Links
 * \brief Creates symbolic links to other files in other shares.
 *
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component. User must also have RW access to all link and target paths.
 * - If access to a target or link path is lowered or removed, links owned by that user will be removed.
 */
class Links
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'links';

    /**
     * \par Description:
     * This GET request returns link and target information for a given target path or for a given link path.
     *
     * \par Security:
     * - User must be authenticated as a Cloud Holder/Admin.
     * - Links for which the requesting user does not have RW access to link_path or target_path will be excluded.
     * - If access to a target or link path is lowered or removed, links owned by that user will be removed.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/links/{link_path}
     * - http://localhost/api/@REST_API_VERSION/rest/links?target_path={target_path}
     * - http://localhost/api/@REST_API_VERSION/rest/links?link_path_prefix={link_path_prefix}
     *
     * \param link_path String - optional
     * \param target_path String - optional
     * \param link_path_prefix - optional
     *
     * \par Parameter Details:
     * - link_path - A path to a link that is a direct child of the share root.
     * - target_path - A path to a file or directory in a share.
     * - link_path_prefix - A prefix to a link_path.
     *   Should be a path to the root, a folder or a link (ex. "/", "/PublicLS", "/PublicLS/linkOne", NOT "/Publ").
     *
     * \par HTTP Response Codes:
     * - 200 - OK
     * - 400 - Bad Request
     * - 404 - Not Found
     * - 401 - Unauthorized
     *
     * \par Error Codes:
     * - 2306 - Link does not exist
     * - 307 - Parameter Missing
     * - 89 - Parameter is conflicting
     * - 75 - Share not found
     * - 46 - Share is inaccessible
     * - 57 - User not authorized
     *
     * \par XML Response Example:
     * \code
<links>
    <link>
        <link_path>/share2/a name.jpg</link_path>
        <target_path>/share1/sub dir/a name.jpg</target_path>
        <owner>
            <username>guest</username>
        </owner>
    </link>
    <link>
        <link_path>/share2/another name.jpg</link_path>
        <target_path>/share1/sub dir/a name.jpg</target_path>
        <owner>
            <username>guest</username>
        </owner>
    </link>
</links>
      \endcode
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        $paramSum = !empty($urlPath) + isset($queryParams['target_path']) + isset($queryParams['link_path_prefix']);
        if ($paramSum === 0) {
            throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, self::COMPONENT_NAME);
        }

        if ($paramSum !== 1) {
            throw new \Core\Rest\Exception('CONFLICTING_PARAMETER', 400, NULL, self::COMPONENT_NAME);
        }

        $results = NULL;

        try {
            if (!empty($urlPath)) {
                $results = Model\Link::getMapFromLink(implode(DS, $urlPath), FALSE);
            } else if(isset($queryParams['target_path'])) {
                $results = Model\Link::getMapFromTarget($queryParams['target_path'], FALSE);
            } else {
                $results = Model\Link::getMapFromLinkPrefix($queryParams['link_path_prefix']);
            }
        } catch (Model\LinkException $le) {
            throw new \Core\Rest\Exception($le->getMessage(), $le->getCode(), $le, self::COMPONENT_NAME);
        }

        $output = new \OutputWriter(strtoupper($outputFormat));
        $output->pushElement(self::COMPONENT_NAME);
        $output->pushArray('link');

        foreach ($results as $result) {
            $output->pushArrayElement();
            $output->element('link_path', $result['link_path']);
            $output->element('target_path', $result['target_path']);
            $output->pushElement('owner');
            $output->element('username', $result['owner']);
            $output->popElement();
            $output->popArrayElement();
        }

        $output->popArray();
        $output->popElement();
        $output->close();
    }

    /**
     * \par Description:
     * This PUT request is used to create or update symbolic links.
     *
     * \par Security:
     * - User must be authenticated as a Cloud Holder/Admin.
     * - User must have RW access to all link and target paths.
     * - If access to a target or link path is lowered or removed, links owned by that user will be removed.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/links
     *
     * \par HTTP PUT Request
     * Content-Type header needs to be application/json.
     * Body should be a JSON object similar to:
     * \code
{
    "links": [
        {"target_path": "/share1/sub dir/a name.jpg", "link_path": "/share2/another name.jpg"},
        {"target_path": "/share1/a name.jpg", "link_path": "/share3/another name.jpg"}
    ]
}
    \endcode
     *
     * \param links JSON Array - required
     * \param links[][target_path] String - required
     * \param links[][link_path] String - required
     *
     * \par Parameter Details:
     * - links - A JSON array containing JSON objects.
     * - links[][target_path] - A path specifying a file in a share that the link path will point to.
     * - links[][link_path] - A path specifying a name that is a direct child of a share root (e.g. /FriendShare/myLink.jpg).
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - OK
     * - 400 - Bad Request
     * - 401 - Unauthorized
     * - 404 - Not Found
     * - 500 - Internal Server Error
     *
     * \par Error Codes:
     * - 57 - User not authorized
     * - 2303 - Content-Type header must be application/json
     * - 2311 - links field is missing
     * - 2310 - links field is not an array
     * - 2312 - target_path field is missing
     * - 2313 - link_path field is missing
     * - 2304 - Target does not exist
     * - 2309 - File exists and is not a link
     * - 2308 - Link name is not a child of a share root
     * - 2300 - Error creating link
     * - 2305 - Target is not a file or directory
     * - 75 - Share not found
     * - 46 - Share is inaccessible
     *
     * \par XML Response Example:
     * \code
<links>
    <status>Success</status>
</links>
      \endcode
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        //ignoring any parameters on content-type for json since the spec doesn't define any and yet browsers (firefox) send it.
        if (!isset($_SERVER['CONTENT_TYPE']) || trim(explode(';', $_SERVER['CONTENT_TYPE'], 2)[0]) !== 'application/json') {
            throw new \Core\Rest\Exception('CONTENT_TYPE_HEADER_NOT_JSON', 400, NULL, self::COMPONENT_NAME);
        }

        $body = json_decode(file_get_contents("php://input"), true);
        if (!isset($body['links'])) {
            throw new \Core\Rest\Exception('LINKS_FIELD_MISSING', 400, NULL, self::COMPONENT_NAME);
        }

        if (!is_array($body['links'])) {
            throw new \Core\Rest\Exception('LINKS_FIELD_NOT_ARRAY', 400, NULL, self::COMPONENT_NAME);
        }

        foreach ($body['links'] as $map) {
            if (!isset($map['target_path'])) {
                throw new \Core\Rest\Exception('TARGET_PATH_FIELD_MISSING', 400, NULL, self::COMPONENT_NAME);
            }

            if (!isset($map['link_path'])) {
               throw new \Core\Rest\Exception('LINK_PATH_FIELD_MISSING', 400, NULL, self::COMPONENT_NAME);
            }
        }

        try {
            Model\Link::createLinks($body['links'], \Auth\User\UserSecurity::getInstance()->getSessionUsername());
        } catch (Model\LinkException $le) {
            throw new \Core\Rest\Exception($le->getMessage(), $le->getCode(), $le, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, ['status' => 'Success'], $outputFormat);
    }

    /**
     * \par Description:
     * This DELETE request is used to remove symbolic links.
     *
     * \par Security:
     * - User must be authenticated as a Cloud Holder/Admin.
     * - User must have RW access to all link paths.
     * - If access to a target or link path is lowered or removed, links owned by that user will be removed.
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/links/{link_path} (without body)
     * - http://localhost/api/@REST_API_VERSION/rest/links (with body)
     *
     * \par HTTP DELETE for requests with body:
     * Content-Type header needs to be application/json.
     * Body should be a JSON object similar to:
     * \code
{
    "links": [
        {"link_path": "/share2/another name.jpg"},
        {"link_path": "/share3/another name.jpg"}
    ]
}
    \endcode
     *
     * \param link_path String - required for request without body
     * \param links JSON Array - required for request with body
     * \param links[][link_path] String - required for request with body
     *
     * \par Parameter Details:
     * - link_path - A path to a link that is a direct child of the share root. Cannot be given if request has a body.
     * - links - A JSON array containing JSON objects.
     * - links[][link_path] - A path to a link that is a direct child of the share root.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - OK
     * - 400 - Bad Request
     * - 401 - Unauthorized
     * - 404 - Not Found
     * - 500 - Internal Server Error
     *
     * \par Error Codes:
     * - 57 - User not authorized
     * - 2303 - Content-Type header must be application/json
     * - 2311 - links field is missing
     * - 2310 - links field is not an array
     * - 2313 - link_path field is missing
     * - 2307 - Path is not a link
     * - 75 - Share not found
     * - 46 - Share is inaccessible
     * - 307 - Parameter Missing
     * - 89 - Parameter is conflicting
     * - 2301 - Error deleting link
     * - 2308 - Link name is not a child of a share root
     * - 2306 - Link does not exist
     *
     * \par XML Response Example:
     * \code
<links>
    <status>Success</status>
</links>
     \endcode
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        $toDelete = [];

        $body = json_decode(file_get_contents("php://input"), true);

        if ($body !== NULL && !empty($urlPath)) {
            throw new \Core\Rest\Exception('CONFLICTING_PARAMETER', 400, NULL, self::COMPONENT_NAME);
        }

        if ($body === NULL && empty($urlPath)) {
            throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, self::COMPONENT_NAME);
        }

        if (!empty($urlPath)) {
            $toDelete[] = implode(DS, $urlPath);
        } else {
            //ignoring any parameters on content-type for json since the spec doesn't define any and yet browsers (firefox) send it.
            if (!isset($_SERVER['CONTENT_TYPE']) || trim(explode(';', $_SERVER['CONTENT_TYPE'], 2)[0]) !== 'application/json') {
                throw new \Core\Rest\Exception('CONTENT_TYPE_HEADER_NOT_JSON', 400, NULL, self::COMPONENT_NAME);
            }

            if (!isset($body['links'])) {
                throw new \Core\Rest\Exception('LINKS_FIELD_MISSING', 400, NULL, self::COMPONENT_NAME);
            }

            if (!is_array($body['links'])) {
                throw new \Core\Rest\Exception('LINKS_FIELD_NOT_ARRAY', 400, NULL, self::COMPONENT_NAME);
            }

            foreach ($body['links'] as $linkInfo) {
                if (!isset($linkInfo['link_path'])) {
                    throw new \Core\Rest\Exception('LINK_PATH_FIELD_MISSING', 400, NULL, self::COMPONENT_NAME);
                }

                $toDelete[] =  $linkInfo['link_path'];
            }
        }

        try {
            Model\Link::deleteLinks($toDelete);
        } catch (Model\LinkException $le) {
            throw new \Core\Rest\Exception($le->getMessage(), $le->getCode(), $le, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, ['status' => 'Success'], $outputFormat);
    }
}
