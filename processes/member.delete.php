<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원을 그룹에서 제외하거나, 비활성화한다.
 *
 * @file /modules/member/processes/member.delete.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 31.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['edit']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member_ids = Request::get('member_ids', true);
$member_ids = explode(',', $member_ids);
$group_id = Request::get('group_id');

if ($group_id !== null) {
    foreach ($member_ids as $member_id) {
        $me->getGroup($group_id)?->removeMember($member_id);
    }
} else {
}

$results->success = true;
$results->group_id = $group_id;
$results->member_ids = $member_ids;
