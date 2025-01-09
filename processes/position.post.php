<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹의 권한을 수정한다.
 *
 * @file /modules/member/processes/position.post.php
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2025. 1. 6.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['groups']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$group_id = Request::get('group_id');
$member_id = Request::get('member_id');
$position = Request::get('position');

if ($group_id === null) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}
if ($member_id === null) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$me->db()
    ->update($me->table('group_members'), [
        'position' => $position,
    ])
    ->where('member_id', $member_id)
    ->where('group_id', $group_id)
    ->execute();

$results->success = true;
