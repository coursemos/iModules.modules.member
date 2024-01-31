<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 클라이언트 프리셋을 가져온다.
 *
 * @file /modules/member/processes/oauth.presets.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 17.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if (
    $me
        ->getAdmin()
        ->getAdministrator()
        ?->isMaster() !== true
) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

/**
 * @var \modules\member\admin\MemberAdmin $mAdmin
 */
$mAdmin = $me->getAdmin();

$results->success = true;
$results->records = $mAdmin->getOAuthClientPresets();
